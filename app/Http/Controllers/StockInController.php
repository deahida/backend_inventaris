<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStockInRequest;
use App\Models\Product;
use App\Models\StockInHeader;
use App\Models\StockInItem;
use App\Models\StockTransaction;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockInController extends Controller
{
    use ApiResponse;

    /**
     * List stock-in batches (paginated) with supplier and recorder.
     */
    public function index(Request $request): JsonResponse
    {
        $query = StockInHeader::with(['supplier', 'user'])
            ->orderByDesc('date')
            ->orderByDesc('id');

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $perPage = (int) $request->get('per_page', 15);
        $headers = $query->paginate($perPage);

        return $this->success([
            'data'       => $headers->items(),
            'pagination' => [
                'total'        => $headers->total(),
                'per_page'     => $headers->perPage(),
                'current_page' => $headers->currentPage(),
                'last_page'    => $headers->lastPage(),
            ],
        ]);
    }

    /**
     * Show a single stock-in batch with all line items and product details.
     */
    public function show(StockInHeader $stockIn): JsonResponse
    {
        $stockIn->load(['supplier', 'user', 'items.product']);

        return $this->success($stockIn);
    }

    /**
     * Create a stock-in batch.
     *
     * This is an ATOMIC operation:
     *   1. Create stock_in_headers record.
     *   2. For each item:
     *      a. Lock the product row.
     *      b. Read current stock (stock_before).
     *      c. Create stock_in_items record.
     *      d. Update product.stock and product.purchase_price.
     *      e. Create stock_transactions record (type=masuk).
     *   3. Update header total.
     *
     * If anything fails, the entire transaction rolls back.
     */
    public function store(StoreStockInRequest $request): JsonResponse
    {
        $userId = $request->user()->id;

        try {
            $result = DB::transaction(function () use ($request, $userId) {
                // 1. Create header (total will be updated after items are processed)
                $header = StockInHeader::create([
                    'supplier_id' => $request->supplier_id,
                    'date'        => $request->date,
                    'reference'   => $request->reference,
                    'total'       => 0,
                    'user_id'     => $userId,
                ]);

                $total = 0;

                foreach ($request->items as $itemData) {
                    // 2a. Lock product row to prevent concurrent modifications
                    /** @var Product $product */
                    $product = Product::lockForUpdate()->findOrFail($itemData['product_id']);

                    $stockBefore = $product->stock;
                    $quantity    = (int) $itemData['quantity'];
                    $unitPrice   = (float) $itemData['unit_price'];
                    $subtotal    = $quantity * $unitPrice;
                    $stockAfter  = $stockBefore + $quantity;

                    // 2b. Create line item
                    StockInItem::create([
                        'stock_in_header_id' => $header->id,
                        'product_id'         => $product->id,
                        'quantity'           => $quantity,
                        'unit_price'         => $unitPrice,
                        'subtotal'           => $subtotal,
                    ]);

                    // 2c. Update product stock and purchase price
                    $product->update([
                        'stock'          => $stockAfter,
                        'purchase_price' => $unitPrice, // update to latest purchase price
                    ]);

                    // 2d. Create stock transaction record
                    StockTransaction::create([
                        'date'        => $request->date,
                        'product_id'  => $product->id,
                        'type'        => 'masuk',
                        'quantity'    => $quantity,  // always positive
                        'stock_before'=> $stockBefore,
                        'stock_after' => $stockAfter,
                        'reference'   => $request->reference,
                        'notes'       => null,
                        'user_id'     => $userId,
                        'supplier_id' => $request->supplier_id,
                        'unit_price'  => $unitPrice,
                        'reason'      => null,
                    ]);

                    $total += $subtotal;
                }

                // 3. Update header total
                $header->update(['total' => $total]);

                return $header->load(['supplier', 'user', 'items.product']);
            });

            return $this->created($result, 'Stock in recorded successfully');

        } catch (\Throwable $e) {
            return $this->error('Failed to record stock in: ' . $e->getMessage(), 500);
        }
    }
}
