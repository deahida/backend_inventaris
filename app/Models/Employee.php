<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * PRO.COM Employee model.
 *
 * Represents a staff member. An employee may exist independently of a User
 * account — e.g. a staff member who does not log into the system.
 * Conversely, a User account may be linked to an employee via users.employee_id.
 *
 * Mass-assignable:
 *   employee_id, name, email, phone, position, address, join_date, status, avatar
 *
 * NOT mass-assignable:
 *   id, created_at, updated_at
 *
 * @property int         $id
 * @property string      $employee_id   Auto-generated code (EMP-001, ...)
 * @property string      $name
 * @property string      $email
 * @property string|null $phone
 * @property string|null $position
 * @property string|null $address
 * @property string|null $join_date
 * @property string      $status        aktif | nonaktif
 * @property string|null $avatar
 */
#[Fillable(['employee_id', 'name', 'email', 'phone', 'position', 'address', 'join_date', 'status', 'avatar'])]
class Employee extends Model
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
            'join_date' => 'date',
        ];
    }

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * The user account linked to this employee, if any.
     * A user may not exist for every employee (no login required).
     */
    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }

    /**
     * All attendance records for this employee.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
