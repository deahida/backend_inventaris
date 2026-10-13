<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PRO.COM StockTransaction model.
 *
 * Unified ledger of ALL stock movements for all products.
 *
 * Transaction types:
 *   masuk       → stock received from supplier (stock increases)
 *   keluar      → stock removed manually (damage, internal use, etc.)
 *   penjualan   → stock deducted due to a sale
 *   penyesuaian → manual adjustment (stock opname)
 *
 * CRITICAL:
 *   - quantity is ALWAYS stored as a POSITIVE integer.
 *   - The "type" field determines the direction (increase or decrease).
 *   - Never store negative quantities here.
 *
 * stock_before and stock_after capture the product stock level at the
 * exact moment of the transaction, providing a complete audit trail.
 *
 * Mass-assignable:
 *   date, product_id, type, quantity, stock_before, stock_after,
 *   reference, notes, user_id, supplier_id, unit_price, reason
 *
 * @property int         $id
 * @property \Carbon\Carbon $date
 * @property int         $product_id
 * @property string      $type         masuk | keluar | penjualan | penyesuaian
 * @property int         $quantity     Always positive
 * @property int         $stock_before Stock level BEFORE this transaction
 * @property int         $stock_after  Stock level AFTER this transaction
 * @property string|null $reference    Invoice / PO / sale invoice reference
 * @property string|null $notes
 * @property int|null    $user_id
 * @property int|null    $supplier_id  Relevant for type=masuk
 * @property float|null  $unit_price
 * @property string|null $reason       For keluar / penyesuaian
 */
#[Fillable([
    'date', 'product_id', 'type', 'quantity',
    'stock_before', 'stock_after',
    'reference', 'notes',
    'user_id', 'supplier_id',
    'unit_price', 'reason',
])]
class StockTransaction extends Model
{
    use HasFactory;

    // =========================================================================
    // CASTS
    // =========================================================================

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date'         => 'date',
            'product_id'   => 'integer',
            'quantity'     => 'integer',
            'stock_before' => 'integer',
            'stock_after'  => 'integer',
            'user_id'      => 'integer',
            'supplier_id'  => 'integer',
            'unit_price'   => 'decimal:2',
        ];
    }

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * The product whose stock was affected by this transaction.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * The user who triggered this transaction.
     * Nullable — SET NULL when user is deleted.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The supplier associated with this transaction.
     * Only relevant for type = 'masuk'.
     * Nullable — SET NULL when supplier is deleted.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
