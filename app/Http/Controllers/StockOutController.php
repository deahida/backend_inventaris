<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStockOutRequest;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StockOutController extends Controller
{
    use ApiResponse;

    /**
     * Record a stock-out event (single product).
     *
     * Rules enforced:
     *   - quantity must be positive (validated in request)
     *   - quantity cannot exceed available stock
     *   - stock never goes negative
     *   - quantity is stored as POSITIVE in stock_transactions
     *   - type = "keluar"
     */
    public function store(StoreStockOutRequest $request): JsonResponse
    {
        $userId = $request->user()->id;

        try {
            $result = DB::transaction(function () use ($request, $userId) {
                /** @var Product $product */
                $product  = Product::lockForUpdate()->findOrFail($request->product_id);
                $quantity = (int) $request->quantity;

                if ($quantity > $product->stock) {
                    throw new \DomainException(
                        "Insufficient stock. Available: {$product->stock}, requested: {$quantity}."
                    );
                }

                $stockBefore = $product->stock;
                $stockAfter  = $stockBefore - $quantity;

                // Update product stock
                $product->update(['stock' => $stockAfter]);

                // Create stock transaction (quantity always positive, type = keluar)
                $transaction = StockTransaction::create([
                    'date'         => $request->date,
                    'product_id'   => $product->id,
                    'type'         => 'keluar',
                    'quantity'     => $quantity,
                    'stock_before' => $stockBefore,
                    'stock_after'  => $stockAfter,
                    'reference'    => $request->reference,
                    'notes'        => $request->notes,
                    'user_id'      => $userId,
                    'supplier_id'  => null,
                    'unit_price'   => null,
                    'reason'       => $request->reason,
                ]);

                return $transaction->load('product');
            });

            return $this->created($result, 'Stock out recorded successfully');

        } catch (\DomainException $e) {
            return $this->unprocessable($e->getMessage());
        } catch (\Throwable $e) {
            return $this->error('Failed to record stock out: ' . $e->getMessage(), 500);
        }
    }
}
