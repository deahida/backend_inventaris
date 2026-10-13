<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * PRO.COM Sale model.
 *
 * Represents a completed POS transaction (invoice header).
 * Line items are stored separately in SaleItem.
 *
 * The FK to users uses the non-standard column name "cashier_id" — this is
 * explicitly specified in the relationship definition below.
 *
 * The "change" attribute is a standard PHP reserved word but Eloquent handles
 * it correctly as a model attribute — it maps directly to the "change" column.
 *
 * Mass-assignable:
 *   invoice, date, cashier_id, subtotal, discount, tax, total,
 *   payment_amount, change, payment_method, status, customer_name, note
 *
 * @property int         $id
 * @property string      $invoice      Unique (INV-YYMMDD-XXXX)
 * @property \Carbon\Carbon $date      Transaction datetime
 * @property int|null    $cashier_id
 * @property float       $subtotal
 * @property float       $discount
 * @property float       $tax
 * @property float       $total
 * @property float       $payment_amount
 * @property float       $change
 * @property string      $payment_method  tunai | transfer | debit | kartu_kredit
 * @property string      $status          selesai | dibatalkan | pending
 * @property string|null $customer_name
 * @property string|null $note
 */
#[Fillable([
    'invoice', 'date', 'cashier_id',
    'subtotal', 'discount', 'tax', 'total',
    'payment_amount', 'change',
    'payment_method', 'status',
    'customer_name', 'note',
])]
class Sale extends Model
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
            'date'           => 'datetime',
            'cashier_id'     => 'integer',
            'subtotal'       => 'decimal:2',
            'discount'       => 'decimal:2',
            'tax'            => 'decimal:2',
            'total'          => 'decimal:2',
            'payment_amount' => 'decimal:2',
            'change'         => 'decimal:2',
        ];
    }

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * The cashier (user) who processed this sale.
     * Uses non-standard FK name: sales.cashier_id → users.id
     * Nullable — SET NULL if the user is deleted.
     */
    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    /**
     * The individual product line items for this sale.
     */
    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }
}
