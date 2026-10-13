<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Employee;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    use ApiResponse;

    /**
     * List employees with optional status filter and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Employee::with('user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage   = (int) $request->get('per_page', 15);
        $employees = $query->orderBy('name')->paginate($perPage);

        return $this->success([
            'data'       => collect($employees->items())->map(fn ($e) => $this->format($e)),
            'pagination' => [
                'total'        => $employees->total(),
                'per_page'     => $employees->perPage(),
                'current_page' => $employees->currentPage(),
                'last_page'    => $employees->lastPage(),
            ],
        ]);
    }

    /**
     * Show a single employee.
     */
    public function show(Employee $employee): JsonResponse
    {
        $employee->load('user');

        return $this->success($this->format($employee));
    }

    /**
     * Create a new employee.
     *
     * If create_user=true is sent, also creates a linked User account.
     * Employee code is auto-generated (EMP-001, EMP-002, ...).
     */
    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['employee_id'] = $this->generateEmployeeCode();

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('employees', 'public');
        }

        // Remove non-employee fields
        $createUser     = (bool) ($data['create_user'] ?? false);
        $userRole       = $data['role'] ?? 'cashier';
        $userPassword   = $data['password'] ?? null;
        unset($data['create_user'], $data['role'], $data['password']);

        $employee = Employee::create($data);

        // Optionally create a linked user account
        if ($createUser && $userPassword) {
            User::create([
                'name'        => $employee->name,
                'email'       => $employee->email,
                'password'    => Hash::make($userPassword),
                'phone'       => $employee->phone,
                'position'    => $employee->position,
                'role'        => $userRole,
                'avatar'      => $employee->avatar,
                'employee_id' => $employee->id,
            ]);
        }

        $employee->load('user');

        return $this->created($this->format($employee), 'Employee created successfully');
    }

    /**
     * Update employee fields.
     * Does NOT automatically create or modify the linked user account.
     */
    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($employee->avatar && Storage::disk('public')->exists($employee->avatar)) {
                Storage::disk('public')->delete($employee->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('employees', 'public');
        }

        $employee->update($data);
        $employee->load('user');

        return $this->success($this->format($employee->fresh()->load('user')), 'Employee updated successfully');
    }

    /**
     * Deactivate an employee (set status = nonaktif).
     * Does NOT delete the employee or their attendance records.
     * Hard deletion is intentionally not exposed via this endpoint.
     */
    public function destroy(Employee $employee): JsonResponse
    {
        try {
            $result = DB::transaction(function () use ($employee) {
                // Lock the employee row while checking and deleting.
                $lockedEmployee = Employee::query()
                    ->whereKey($employee->getKey())
                    ->lockForUpdate()
                    ->firstOrFail();

                // Preserve attendance history by rejecting deletion
                // when any attendance record references this employee.
                $attendanceCount = $lockedEmployee
                    ->attendances()
                    ->count();

                if ($attendanceCount > 0) {
                    return [
                        'deleted' => false,
                        'attendance_count' => $attendanceCount,
                        'avatar' => null,
                    ];
                }

                $avatarPath = $lockedEmployee->avatar;

                // Preserve login accounts. Only remove their link
                // to this employee; never delete User records here.
                User::where('employee_id', $lockedEmployee->id)
                    ->update(['employee_id' => null]);

                // Permanently delete the employee database record.
                $lockedEmployee->delete();

                return [
                    'deleted' => true,
                    'attendance_count' => 0,
                    'avatar' => $avatarPath,
                ];
            });
        } catch (QueryException $exception) {
            report($exception);

            return $this->conflict(
                'Karyawan tidak dapat dihapus karena masih digunakan oleh data terkait. Periksa relasi database terlebih dahulu.'
            );
        }

        if (! $result['deleted']) {
            $count = $result['attendance_count'];

            return $this->conflict(
                "Karyawan tidak dapat dihapus karena masih memiliki {$count} riwayat absensi."
            );
        }

        // Remove the employee's avatar file only after the
        // database transaction has committed successfully.
        $avatarPath = $result['avatar'];

        if (
            $avatarPath &&
            Storage::disk('public')->exists($avatarPath)
        ) {
            Storage::disk('public')->delete($avatarPath);
        }

        return $this->success(
            ['id' => $employee->id],
            'Karyawan berhasil dihapus permanen.'
        );
    }


    // -------------------------------------------------------------------------

    private function format(Employee $employee): array
    {
        return [
            'id'          => $employee->id,
            'employee_id' => $employee->employee_id,
            'name'        => $employee->name,
            'email'       => $employee->email,
            'phone'       => $employee->phone,
            'position'    => $employee->position,
            'address'     => $employee->address,
            'join_date'   => $employee->join_date?->format('Y-m-d'),
            'status'      => $employee->status,
            'avatar'      => $employee->avatar ? Storage::disk('public')->url($employee->avatar) : null,
            'has_account' => $employee->user !== null,
            'user'        => $employee->user ? [
                'id'   => $employee->user->id,
                'role' => $employee->user->role,
            ] : null,
            'created_at'  => $employee->created_at,
        ];
    }

    private function generateEmployeeCode(): string
    {
        $last = Employee::orderByDesc('id')->value('employee_id');
        $num  = 1;

        if ($last && preg_match('/EMP-(\d+)/', $last, $m)) {
            $num = (int) $m[1] + 1;
        }

        return 'EMP-' . str_pad($num, 3, '0', STR_PAD_LEFT);
    }
}
