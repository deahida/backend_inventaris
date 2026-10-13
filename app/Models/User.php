<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * PRO.COM User model.
 *
 * Represents a system user with login credentials.
 * A user may optionally be linked to an Employee record via employee_id.
 *
 * Roles: admin | cashier | owner
 *
 * Mass-assignable:
 *   name, email, password, phone, position, role, avatar, employee_id
 *
 * NOT mass-assignable (intentionally excluded):
 *   id, email_verified_at, remember_token, created_at, updated_at
 *
 * Hidden from JSON serialization:
 *   password, remember_token
 *
 * @property int         $id
 * @property string      $name
 * @property string      $email
 * @property string      $phone
 * @property string      $position
 * @property string      $role
 * @property string|null $avatar
 * @property int|null    $employee_id
 */
#[Fillable(['name', 'email', 'password', 'phone', 'position', 'role', 'avatar', 'employee_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    // =========================================================================
    // CASTS
    // =========================================================================

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'employee_id'       => 'integer',
        ];
    }

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * The employee profile linked to this user account.
     * Nullable — a user may not have an employee record.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Sales transactions processed by this user as cashier.
     * FK: sales.cashier_id → users.id
     */
    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'cashier_id');
    }

    /**
     * Stock-in batches recorded by this user.
     * FK: stock_in_headers.user_id → users.id
     */
    public function stockInHeaders(): HasMany
    {
        return $this->hasMany(StockInHeader::class);
    }

    /**
     * Stock transactions triggered by this user.
     * FK: stock_transactions.user_id → users.id
     */
    public function stockTransactions(): HasMany
    {
        return $this->hasMany(StockTransaction::class);
    }
}
