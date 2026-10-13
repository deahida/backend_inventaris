<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PRO.COM StockInItem model.
 *
 * Represents a single product line within a StockInHeader batch.
 * Deletion of the parent StockInHeader cascades to these items.
 *
 * Mass-assignable:
 *   stock_in_header_id, product_id, quantity, unit_price, subtotal
 *
 * @property int   $id
 * @property int   $stock_in_header_id
 * @property int   $product_id
 * @property int   $quantity
 * @property float $unit_price   Purchase price per unit for this delivery
 * @property float $subtotal     quantity × unit_price
 */
#[Fillable(['stock_in_header_id', 'product_id', 'quantity', 'unit_price', 'subtotal'])]
class StockInItem extends Model
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
            'stock_in_header_id' => 'integer',
            'product_id'         => 'integer',
            'quantity'           => 'integer',
            'unit_price'         => 'decimal:2',
            'subtotal'           => 'decimal:2',
        ];
    }

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * The stock-in batch this item belongs to.
     */
    public function stockInHeader(): BelongsTo
    {
        return $this->belongsTo(StockInHeader::class);
    }

    /**
     * The product received in this line.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
