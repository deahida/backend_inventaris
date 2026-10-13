<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockTransaction;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    use ApiResponse;

    /**
     * List sales with filters and pagination.
     *
     * Filters: date_from, date_to, status, cashier_id, search (invoice)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Sale::with(['cashier', 'items'])
            ->orderByDesc('date')
            ->orderByDesc('id');

        if ($request->filled('search')) {
            $query->where('invoice', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('cashier_id')) {
            $query->where('cashier_id', $request->cashier_id);
        }

        $perPage = (int) $request->get('per_page', 15);
        $sales   = $query->paginate($perPage);

        return $this->success([
            'data'       => collect($sales->items())->map(fn ($s) => $this->format($s)),
            'pagination' => [
                'total'        => $sales->total(),
                'per_page'     => $sales->perPage(),
                'current_page' => $sales->currentPage(),
                'last_page'    => $sales->lastPage(),
            ],
        ]);
    }

    /**
     * Show a single sale with items and cashier details.
     */
    public function show(Sale $sale): JsonResponse
    {
        $sale->load(['cashier', 'items.product']);

        return $this->success($this->format($sale));
    }

    /**
     * Create a new sale (POS checkout).
     *
     * ATOMIC operation:
     *   1. Validate all items and product existence.
     *   2. Lock all affected product rows.
     *   3. Verify sufficient stock for every item.
     *   4. Calculate financial totals SERVER-SIDE (do not trust frontend totals).
     *   5. Verify payment_amount >= total.
     *   6. Create sales record.
     *   7. Create sale_items records (with product snapshots).
     *   8. Deduct stock for each product.
     *   9. Create stock_transactions records (type = penjualan).
     *
     * All or nothing — if any step fails, the full transaction rolls back.
     */
    public function store(StoreSaleRequest $request): JsonResponse
    {
        $cashierId = $request->user()->id;

        try {
            $result = DB::transaction(function () use ($request, $cashierId) {
                $now      = Carbon::now();
                $discount = (float) ($request->discount ?? 0);
                $tax      = (float) ($request->tax ?? 0);

                // --- Step 1 & 2: Lock all products and verify stock ---
                $productIds = collect($request->items)->pluck('product_id')->unique();
                $products   = Product::lockForUpdate()
                    ->whereIn('id', $productIds)
                    ->get()
                    ->keyBy('id');

                // Verify every product exists
                foreach ($productIds as $pid) {
                    if (! $products->has($pid)) {
                        throw new \DomainException("Product #{$pid} not found.");
                    }
                }

                // --- Step 3: Aggregate quantities per product and check stock ---
                $itemQuantities = [];
                foreach ($request->items as $item) {
                    $pid = $item['product_id'];
                    $itemQuantities[$pid] = ($itemQuantities[$pid] ?? 0) + $item['quantity'];
                }

                foreach ($itemQuantities as $pid => $totalQty) {
                    $product = $products->get($pid);
                    if ($totalQty > $product->stock) {
                        throw new \DomainException(
                            "Insufficient stock for product \"{$product->name}\". Available: {$product->stock}, requested: {$totalQty}."
                        );
                    }
                }

                // --- Step 4: Calculate totals SERVER-SIDE ---
                $subtotal = 0;
                $lineItems = [];

                foreach ($request->items as $item) {
                    $product   = $products->get($item['product_id']);
                    $qty       = (int) $item['quantity'];
                    $unitPrice = (float) $product->selling_price; // always use DB price
                    $lineSub   = $unitPrice * $qty;
                    $subtotal += $lineSub;

                    $lineItems[] = [
                        'product'      => $product,
                        'quantity'     => $qty,
                        'unit_price'   => $unitPrice,
                        'subtotal'     => $lineSub,
                    ];
                }

                $total         = $subtotal - $discount + $tax;
                $paymentAmount = (float) $request->payment_amount;

                // --- Step 5: Verify payment ---
                if ($paymentAmount < $total) {
                    throw new \DomainException(
                        "Payment amount ({$paymentAmount}) is less than total ({$total})."
                    );
                }

                $change = $paymentAmount - $total;

                // --- Step 6: Create sales record ---
                $sale = Sale::create([
                    'invoice'        => $this->generateInvoice(),
                    'date'           => $now,
                    'cashier_id'     => $cashierId,
                    'subtotal'       => $subtotal,
                    'discount'       => $discount,
                    'tax'            => $tax,
                    'total'          => $total,
                    'payment_amount' => $paymentAmount,
                    'change'         => $change,
                    'payment_method' => $request->payment_method,
                    'status'         => 'selesai',
                    'customer_name'  => $request->customer_name,
                    'note'           => $request->note,
                ]);

                // --- Steps 7, 8, 9: Items, stock deduction, transactions ---
                foreach ($lineItems as $line) {
                    /** @var Product $product */
                    $product     = $line['product'];
                    $stockBefore = $product->stock;
                    $stockAfter  = $stockBefore - $line['quantity'];

                    // 7. Sale item with product snapshot
                    SaleItem::create([
                        'sale_id'      => $sale->id,
                        'product_id'   => $product->id,
                        'product_code' => $product->code,
                        'product_name' => $product->name,
                        'quantity'     => $line['quantity'],
                        'unit_price'   => $line['unit_price'],
                        'subtotal'     => $line['subtotal'],
                    ]);

                    // 8. Deduct stock
                    $product->decrement('stock', $line['quantity']);

                    // 9. Stock transaction (type = penjualan, quantity positive)
                    StockTransaction::create([
                        'date'         => $now->toDateString(),
                        'product_id'   => $product->id,
                        'type'         => 'penjualan',
                        'quantity'     => $line['quantity'],
                        'stock_before' => $stockBefore,
                        'stock_after'  => $stockAfter,
                        'reference'    => $sale->invoice,
                        'notes'        => null,
                        'user_id'      => $cashierId,
                        'supplier_id'  => null,
                        'unit_price'   => $line['unit_price'],
                        'reason'       => null,
                    ]);
                }

                return $sale->load(['cashier', 'items.product']);
            });

            return $this->created($this->format($result), 'Sale completed successfully');

        } catch (\DomainException $e) {
            return $this->unprocessable($e->getMessage());
        } catch (\Throwable $e) {
            return $this->error('Failed to process sale: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancel a completed sale.
     *
     * Rules:
     *   - Only 'selesai' sales can be cancelled.
     *   - 'dibatalkan' sales cannot be cancelled again.
     *   - Restores stock for each item.
     *   - Creates stock_transactions with type = 'penyesuaian' (adjustment).
     *   - Preserves the original sale record (audit trail).
     *
     * Authorization: admin or owner only (enforced at route level via middleware).
     */
    public function cancel(Request $request, Sale $sale): JsonResponse
    {
        if ($sale->status !== 'selesai') {
            return $this->conflict("Sale cannot be cancelled. Current status: {$sale->status}.");
        }

        try {
            DB::transaction(function () use ($sale, $request) {
                $userId = $request->user()->id;
                $today  = now()->toDateString();

                foreach ($sale->items as $item) {
                    /** @var Product $product */
                    $product     = Product::lockForUpdate()->findOrFail($item->product_id);
                    $stockBefore = $product->stock;
                    $stockAfter  = $stockBefore + $item->quantity;

                    // Restore stock
                    $product->increment('stock', $item->quantity);

                    // Create reversal stock transaction
                    StockTransaction::create([
                        'date'         => $today,
                        'product_id'   => $product->id,
                        'type'         => 'penyesuaian',
                        'quantity'     => $item->quantity, // positive (restoration)
                        'stock_before' => $stockBefore,
                        'stock_after'  => $stockAfter,
                        'reference'    => $sale->invoice,
                        'notes'        => "Pembatalan penjualan: {$sale->invoice}",
                        'user_id'      => $userId,
                        'supplier_id'  => null,
                        'unit_price'   => $item->unit_price,
                        'reason'       => 'Pembatalan penjualan',
                    ]);
                }

                $sale->update(['status' => 'dibatalkan']);
            });

            return $this->success($this->format($sale->fresh()->load(['cashier', 'items'])), 'Sale cancelled successfully');

        } catch (\Throwable $e) {
            return $this->error('Failed to cancel sale: ' . $e->getMessage(), 500);
        }
    }

    // -------------------------------------------------------------------------

    private function format(Sale $sale): array
    {
        return [
            'id'             => $sale->id,
            'invoice'        => $sale->invoice,
            'date'           => $sale->date,
            'cashier_id'     => $sale->cashier_id,
            'cashier'        => $sale->cashier ? [
                'id'   => $sale->cashier->id,
                'name' => $sale->cashier->name,
            ] : null,
            'subtotal'       => (float) $sale->subtotal,
            'discount'       => (float) $sale->discount,
            'tax'            => (float) $sale->tax,
            'total'          => (float) $sale->total,
            'payment_amount' => (float) $sale->payment_amount,
            'change'         => (float) $sale->change,
            'payment_method' => $sale->payment_method,
            'status'         => $sale->status,
            'customer_name'  => $sale->customer_name,
            'note'           => $sale->note,
            'items'          => $sale->items ? $sale->items->map(fn ($i) => [
                'id'           => $i->id,
                'product_id'   => $i->product_id,
                'product_code' => $i->product_code,
                'product_name' => $i->product_name,
                'quantity'     => (int) $i->quantity,
                'unit_price'   => (float) $i->unit_price,
                'subtotal'     => (float) $i->subtotal,
            ])->values() : [],
            'created_at'     => $sale->created_at,
        ];
    }

    /**
     * Generate unique invoice: INV-YYMMDD-XXXX
     */
    private function generateInvoice(): string
    {
        $prefix = 'INV-' . now()->format('ymd') . '-';
        $last   = Sale::where('invoice', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->value('invoice');

        $seq = 1;
        if ($last && preg_match('/INV-\d{6}-(\d+)/', $last, $m)) {
            $seq = (int) $m[1] + 1;
        }

        return $prefix . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }
}
