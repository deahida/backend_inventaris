<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * PRO.COM Supplier model.
 *
 * Represents a product supplier / vendor.
 * The code is auto-generated (SUP-001, SUP-002, ...) and must be unique.
 *
 * @property int         $id
 * @property string      $code          Unique supplier code (SUP-001, ...)
 * @property string      $name
 * @property string|null $phone
 * @property string|null $email
 * @property string|null $address
 * @property string|null $contact_person
 * @property string      $status        aktif | nonaktif
 */
#[Fillable(['code', 'name', 'phone', 'email', 'address', 'contact_person', 'status'])]
class Supplier extends Model
{
    use HasFactory;

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * Products sourced from this supplier.
     * Deletion of a supplier is BLOCKED at DB level if products reference it.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Stock-in batches received from this supplier.
     * Deletion of a supplier is BLOCKED at DB level if stock_in_headers reference it.
     */
    public function stockInHeaders(): HasMany
    {
        return $this->hasMany(StockInHeader::class);
    }

    /**
     * Stock transactions associated with this supplier (type = masuk).
     * supplier_id is nullable — relevant only for 'masuk' type transactions.
     */
    public function stockTransactions(): HasMany
    {
        return $this->hasMany(StockTransaction::class);
    }
}
