<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * PRO.COM StockInHeader model.
 *
 * Represents the header of a stock-in event: one delivery batch from one supplier.
 * Each batch may contain multiple products (StockInItem).
 *
 * Mass-assignable:
 *   supplier_id, date, reference, total, user_id
 *
 * @property int         $id
 * @property \Carbon\Carbon $date     Date of the delivery
 * @property int         $supplier_id
 * @property string|null $reference  PO / delivery note number
 * @property float       $total      Total monetary value of the batch
 * @property int|null    $user_id    Who recorded this batch (SET NULL on user delete)
 */
#[Fillable(['supplier_id', 'date', 'reference', 'total', 'user_id'])]
class StockInHeader extends Model
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
            'date'        => 'date',
            'total'       => 'decimal:2',
            'supplier_id' => 'integer',
            'user_id'     => 'integer',
        ];
    }

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * The supplier who delivered this batch.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * The user who recorded this stock-in.
     * Nullable — the user account may be removed while the record is kept.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The individual product line items in this batch.
     */
    public function items(): HasMany
    {
        return $this->hasMany(StockInItem::class);
    }
}
