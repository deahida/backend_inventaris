<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * PRO.COM Category model.
 *
 * Product category. The name must be unique (enforced at DB level).
 *
 * product_count is NOT a stored column — it should be computed via
 *   withCount('products') in the controller query, then exposed in the
 *   API response. Do not add a product_count column to this model.
 *
 * @property int         $id
 * @property string      $name
 * @property string|null $description
 */
#[Fillable(['name', 'description'])]
class Category extends Model
{
    use HasFactory;

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * Products that belong to this category.
     * Deletion of a category is BLOCKED at DB level if products exist.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
