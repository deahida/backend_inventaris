<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PRO.COM SaleItem model.
 *
 * Represents one product line within a sale.
 *
 * product_code and product_name are SNAPSHOTS captured at the time of sale.
 * They do not change if the product is later renamed or recoded.
 * product_id is retained for reporting (e.g. top-selling products) but
 * is RESTRICTED from deletion at DB level.
 *
 * Mass-assignable:
 *   sale_id, product_id, product_code, product_name,
 *   quantity, unit_price, subtotal
 *
 * @property int    $id
 * @property int    $sale_id
 * @property int    $product_id
 * @property string $product_code  Snapshot at time of sale
 * @property string $product_name  Snapshot at time of sale
 * @property int    $quantity
 * @property float  $unit_price
 * @property float  $subtotal
 */
#[Fillable(['sale_id', 'product_id', 'product_code', 'product_name', 'quantity', 'unit_price', 'subtotal'])]
class SaleItem extends Model
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
            'sale_id'    => 'integer',
            'product_id' => 'integer',
            'quantity'   => 'integer',
            'unit_price' => 'decimal:2',
            'subtotal'   => 'decimal:2',
        ];
    }

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * The sale (invoice) this item belongs to.
     */
    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * The product referenced by this line.
     * Kept for reporting; deletion blocked at DB level.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
