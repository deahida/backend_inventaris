<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * PRO.COM Product model.
 *
 * Represents an item in the store catalog with pricing, stock tracking,
 * physical condition, and listing status.
 *
 * Mass-assignable:
 *   code, name, category_id, supplier_id, purchase_price, selling_price,
 *   stock, min_stock, condition, status, description, image
 *
 * NOT mass-assignable:
 *   id, created_at, updated_at
 *
 * @property int         $id
 * @property string      $code          Unique product code (PRD-00001, ...)
 * @property string      $name
 * @property int         $category_id
 * @property int         $supplier_id
 * @property float       $purchase_price
 * @property float       $selling_price
 * @property int         $stock
 * @property int         $min_stock
 * @property string      $condition     baru | bekas | refurbished
 * @property string      $status        aktif | nonaktif
 * @property string|null $description
 * @property string|null $image         Storage path
 */
#[Fillable([
    'code', 'name', 'category_id', 'supplier_id',
    'purchase_price', 'selling_price',
    'stock', 'min_stock',
    'condition', 'status',
    'description', 'image',
])]
class Product extends Model
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
            'category_id'    => 'integer',
            'supplier_id'    => 'integer',
            'purchase_price' => 'decimal:2',
            'selling_price'  => 'decimal:2',
            'stock'          => 'integer',
            'min_stock'      => 'integer',
        ];
    }

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * The category this product belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * The primary supplier for this product.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Stock-in line items that include this product.
     */
    public function stockInItems(): HasMany
    {
        return $this->hasMany(StockInItem::class);
    }

    /**
     * All stock movement records affecting this product.
     */
    public function stockTransactions(): HasMany
    {
        return $this->hasMany(StockTransaction::class);
    }

    /**
     * Sale line items containing this product.
     */
    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }
}
