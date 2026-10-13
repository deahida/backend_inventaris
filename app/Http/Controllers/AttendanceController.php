<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckInRequest;
use App\Http\Requests\CheckOutRequest;
use App\Http\Requests\ManualAttendanceRequest;
use App\Models\Attendance;
use App\Models\Employee;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttendanceController extends Controller
{
    use ApiResponse;

    // Store GPS coordinates (configurable via settings in Phase 5+)
    private const STORE_LATITUDE  = -6.802841027212759;
    private const STORE_LONGITUDE = 110.84378042207874;
    private const ALLOWED_RADIUS  = 200; // metres

    // =========================================================================
    // TODAY'S OVERVIEW (admin view — all employees)
    // =========================================================================

    public function today(): JsonResponse
    {
        $today = now()->toDateString();

        $employees = Employee::with([
            'attendances' => fn ($q) => $q->whereDate('date', $today),
        ])->where('status', 'aktif')->orderBy('name')->get();

        $data = $employees->map(function (Employee $emp) {
            $att = $emp->attendances->first();
            return $this->formatWithEmployee($emp, $att);
        });

        return $this->success($data);
    }

    // =========================================================================
    // MY ATTENDANCE (auth user's record today)
    // =========================================================================

    public function myAttendance(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return $this->notFound('No employee record linked to your account.');
        }

        $att = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', now()->toDateString())
            ->first();

        return $this->success($att ? $this->format($att) : null);
    }

    // =========================================================================
    // MY HISTORY (auth user's paginated history)
    // =========================================================================

    public function myHistory(Request $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return $this->notFound('No employee record linked to your account.');
        }

        $perPage = (int) $request->get('per_page', 20);
        $query   = Attendance::where('employee_id', $employee->id)
            ->orderByDesc('date');

        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $records = $query->paginate($perPage);

        return $this->success([
            'data'       => collect($records->items())->map(fn ($a) => $this->format($a)),
            'pagination' => [
                'total'        => $records->total(),
                'per_page'     => $records->perPage(),
                'current_page' => $records->currentPage(),
                'last_page'    => $records->lastPage(),
            ],
        ]);
    }

    // =========================================================================
    // ADMIN: ALL ATTENDANCE (with filters)
    // =========================================================================

    public function index(Request $request): JsonResponse
    {
        $query = Attendance::with('employee')
            ->orderByDesc('date')
            ->orderBy('employee_id');

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = (int) $request->get('per_page', 20);
        $records = $query->paginate($perPage);

        return $this->success([
            'data'       => collect($records->items())->map(fn ($a) => $this->format($a)),
            'pagination' => [
                'total'        => $records->total(),
                'per_page'     => $records->perPage(),
                'current_page' => $records->currentPage(),
                'last_page'    => $records->lastPage(),
            ],
        ]);
    }

    // =========================================================================
    // CHECK-IN
    // =========================================================================

    /**
     * Process check-in.
     *
     * Business rules:
     *   1. User must be linked to an employee.
     *   2. Employee cannot have checked in today.
     *   3. GPS must be within ALLOWED_RADIUS (200m) of the store.
     *   4. Selfie photo is required (evidence only — no face matching).
     *   5. Status determined by time: hadir (before 08:00) / terlambat (after/at 08:00).
     *   6. Distance is CALCULATED by the backend — frontend distance is ignored.
     */
    public function checkIn(CheckInRequest $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return $this->notFound('No employee record linked to your account.');
        }

        $today = now()->toDateString();

        // Guard: no double check-in
        if (Attendance::where('employee_id', $employee->id)->whereDate('date', $today)->exists()) {
            return $this->conflict('You have already checked in today.');
        }

        $latitude  = (float) $request->latitude;
        $longitude = (float) $request->longitude;

        // Calculate distance server-side
        $distance = $this->haversineDistance(
            self::STORE_LATITUDE, self::STORE_LONGITUDE,
            $latitude, $longitude
        );

        if ($distance > self::ALLOWED_RADIUS) {
            return $this->unprocessable(
                "You are too far from the store ({$distance}m). Maximum allowed: " . self::ALLOWED_RADIUS . "m."
            );
        }

        // Save selfie photo (evidence only)
        $photoPath = $request->file('photo')->store('attendance/checkin', 'public');

        // Determine attendance status from clock time
        $now    = Carbon::now();
        $status = $now->hour < 8 ? 'hadir' : 'terlambat';

        $attendance = Attendance::create([
            'employee_id'        => $employee->id,
            'date'               => $today,
            'status'             => $status,
            'check_in_at'        => $now,
            'check_in_photo'     => $photoPath,
            'check_in_latitude'  => $latitude,
            'check_in_longitude' => $longitude,
            'check_in_distance'  => (int) round($distance),
        ]);

        return $this->created($this->format($attendance->load('employee')), 'Check-in successful');
    }

    // =========================================================================
    // CHECK-OUT
    // =========================================================================

    /**
     * Process check-out.
     *
     * Business rules:
     *   1. Employee must have already checked in today.
     *   2. Employee cannot check out twice.
     *   3. GPS validated within 200m of store.
     *   4. Selfie required (evidence only).
     *   5. Status is NOT changed by check-out (hadir/terlambat set at check-in).
     */
    public function checkOut(CheckOutRequest $request): JsonResponse
    {
        $employee = $this->resolveEmployee($request);

        if (! $employee) {
            return $this->notFound('No employee record linked to your account.');
        }

        $today = now()->toDateString();
        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        if (! $attendance) {
            return $this->unprocessable('You must check in before checking out.');
        }

        if ($attendance->check_out_at !== null) {
            return $this->conflict('You have already checked out today.');
        }

        $latitude  = (float) $request->latitude;
        $longitude = (float) $request->longitude;

        $distance = $this->haversineDistance(
            self::STORE_LATITUDE, self::STORE_LONGITUDE,
            $latitude, $longitude
        );

        if ($distance > self::ALLOWED_RADIUS) {
            return $this->unprocessable(
                "You are too far from the store ({$distance}m). Maximum allowed: " . self::ALLOWED_RADIUS . "m."
            );
        }

        $photoPath = $request->file('photo')->store('attendance/checkout', 'public');

        $attendance->update([
            'check_out_at'        => now(),
            'check_out_photo'     => $photoPath,
            'check_out_latitude'  => $latitude,
            'check_out_longitude' => $longitude,
            'check_out_distance'  => (int) round($distance),
        ]);

        return $this->success($this->format($attendance->fresh()->load('employee')), 'Check-out successful');
    }

    // =========================================================================
    // MANUAL ATTENDANCE (admin only)
    // =========================================================================

    /**
     * Create a manual attendance record for izin / sakit / alpha.
     * No selfie or GPS required for these statuses.
     * Enforces: one record per employee per date.
     */
    public function manual(ManualAttendanceRequest $request): JsonResponse
    {
        $existing = Attendance::where('employee_id', $request->employee_id)
            ->whereDate('date', $request->date)
            ->first();

        if ($existing) {
            return $this->conflict('An attendance record already exists for this employee on this date.');
        }

        $attendance = Attendance::create([
            'employee_id' => $request->employee_id,
            'date'        => $request->date,
            'status'      => $request->status,
            'note'        => $request->note,
        ]);

        return $this->created($this->format($attendance->load('employee')), 'Manual attendance recorded');
    }

    // =========================================================================
    // REPORT
    // =========================================================================

    /**
     * Monthly attendance summary per employee.
     *
     * Query params: month (YYYY-MM), employee_id (optional)
     */
    public function report(Request $request): JsonResponse
    {
        $month = $request->get('month', now()->format('Y-m'));

        // Parse to get start and end of month
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth()->toDateString();
        $end   = Carbon::createFromFormat('Y-m', $month)->endOfMonth()->toDateString();

        $query = Employee::with([
            'attendances' => fn ($q) => $q->whereBetween('date', [$start, $end]),
        ])->where('status', 'aktif');

        if ($request->filled('employee_id')) {
            $query->where('id', $request->employee_id);
        }

        $employees = $query->orderBy('name')->get();

        $report = $employees->map(function (Employee $emp) {
            $counts = $emp->attendances->countBy('status');
            return [
                'employee_id'   => $emp->id,
                'employee_code' => $emp->employee_id,
                'name'          => $emp->name,
                'position'      => $emp->position,
                'hadir'         => $counts['hadir'] ?? 0,
                'terlambat'     => $counts['terlambat'] ?? 0,
                'izin'          => $counts['izin'] ?? 0,
                'sakit'         => $counts['sakit'] ?? 0,
                'alpha'         => $counts['alpha'] ?? 0,
                'total'         => $emp->attendances->count(),
            ];
        });

        return $this->success([
            'month'   => $month,
            'summary' => $report,
        ]);
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    /**
     * Resolve the employee linked to the authenticated user.
     */
    private function resolveEmployee(Request $request): ?Employee
    {
        $user = $request->user();

        if ($user->employee_id) {
            return Employee::find($user->employee_id);
        }

        // Fallback: match by email
        return Employee::where('email', $user->email)->first();
    }

    /**
     * Haversine formula — calculates distance in metres between two GPS coordinates.
     */
    private function haversineDistance(
        float $lat1, float $lon1,
        float $lat2, float $lon2
    ): float {
        $earthRadius = 6371000; // metres
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2
           + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Format a single attendance record for API response.
     * Exposes both "note" and "notes" for frontend backward compatibility.
     */
    private function format(Attendance $att): array
    {
        return [
            'id'                  => $att->id,
            'employee_id'         => $att->employee_id,
            'employee'            => $att->employee ? [
                'id'          => $att->employee->id,
                'employee_id' => $att->employee->employee_id,
                'name'        => $att->employee->name,
                'position'    => $att->employee->position,
            ] : null,
            'date'                => $att->date?->format('Y-m-d'),
            'status'              => $att->status,
            'check_in_at'         => $att->check_in_at?->format('H:i:s'),
            'check_out_at'        => $att->check_out_at?->format('H:i:s'),
            'check_in_photo'      => $att->check_in_photo ? Storage::disk('public')->url($att->check_in_photo) : null,
            'check_out_photo'     => $att->check_out_photo ? Storage::disk('public')->url($att->check_out_photo) : null,
            'check_in_latitude'   => $att->check_in_latitude,
            'check_in_longitude'  => $att->check_in_longitude,
            'check_in_distance'   => $att->check_in_distance,
            'check_out_latitude'  => $att->check_out_latitude,
            'check_out_longitude' => $att->check_out_longitude,
            'check_out_distance'  => $att->check_out_distance,
            'note'                => $att->note,
            'notes'               => $att->note,  // backward compatibility alias
            'created_at'          => $att->created_at,
        ];
    }

    /**
     * Format employee with their attendance record for today's overview.
     */
    private function formatWithEmployee(Employee $emp, ?Attendance $att): array
    {
        return [
            'employee_id'   => $emp->id,
            'employee_code' => $emp->employee_id,
            'name'          => $emp->name,
            'position'      => $emp->position,
            'avatar'        => $emp->avatar ? Storage::disk('public')->url($emp->avatar) : null,
            'attendance'    => $att ? $this->format($att) : null,
        ];
    }
}
