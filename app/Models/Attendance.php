<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PRO.COM Attendance model.
 *
 * One record per employee per day (enforced by unique composite index on
 * [employee_id, date] at the database level).
 *
 * Check-in and check-out are separate events stored in the SAME row.
 * The employee checks in first (populating check_in_* columns), then later
 * checks out (populating check_out_* columns).
 *
 * Selfie photos (check_in_photo, check_out_photo) are stored as file paths
 * and are EVIDENCE ONLY — no facial recognition, no face matching.
 *
 * Status values:
 *   hadir      → on time (check-in before 08:00)
 *   terlambat  → late (check-in after 08:00)
 *   izin       → approved leave (admin manual entry)
 *   sakit      → sick leave (admin manual entry)
 *   alpha      → absent without notice (admin manual entry)
 *
 * NOTE on note / notes:
 *   The database stores a single "note" column.
 *   The frontend uses both "note" and "notes" interchangeably.
 *   The "notes" accessor below provides backward-compatible read/write access
 *   to the same underlying column WITHOUT adding a second database field.
 *   This allows the Phase 4 API response to include both keys safely.
 *
 * Mass-assignable:
 *   employee_id, date, status,
 *   check_in_at, check_in_photo, check_in_latitude, check_in_longitude, check_in_distance,
 *   check_out_at, check_out_photo, check_out_latitude, check_out_longitude, check_out_distance,
 *   note
 *
 * @property int             $id
 * @property int             $employee_id
 * @property \Carbon\Carbon  $date
 * @property string          $status
 * @property \Carbon\Carbon|null $check_in_at
 * @property string|null     $check_in_photo
 * @property float|null      $check_in_latitude
 * @property float|null      $check_in_longitude
 * @property int|null        $check_in_distance
 * @property \Carbon\Carbon|null $check_out_at
 * @property string|null     $check_out_photo
 * @property float|null      $check_out_latitude
 * @property float|null      $check_out_longitude
 * @property int|null        $check_out_distance
 * @property string|null     $note
 */
#[Fillable([
    'employee_id', 'date', 'status',
    'check_in_at', 'check_in_photo',
    'check_in_latitude', 'check_in_longitude', 'check_in_distance',
    'check_out_at', 'check_out_photo',
    'check_out_latitude', 'check_out_longitude', 'check_out_distance',
    'note',
])]
class Attendance extends Model
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
            'employee_id'        => 'integer',
            'date'               => 'date',
            'check_in_at'        => 'datetime',
            'check_out_at'       => 'datetime',
            'check_in_latitude'  => 'decimal:7',
            'check_in_longitude' => 'decimal:7',
            'check_in_distance'  => 'integer',
            'check_out_latitude' => 'decimal:7',
            'check_out_longitude'=> 'decimal:7',
            'check_out_distance' => 'integer',
        ];
    }

    // =========================================================================
    // ACCESSORS — backward compatibility for note / notes
    // =========================================================================

    /**
     * "notes" is an alias for the "note" database column.
     *
     * The frontend uses both field names interchangeably.
     * Only ONE column exists in the database ("note").
     * This accessor makes the model respond to both "note" and "notes"
     * without changing the schema.
     *
     * In Phase 4, the API resource should append "notes" to the response
     * alongside "note" so both fields are present in the JSON.
     */
    protected function notes(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->note,
            set: fn (string $value) => ['note' => $value],
        );
    }

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * The employee this attendance record belongs to.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
