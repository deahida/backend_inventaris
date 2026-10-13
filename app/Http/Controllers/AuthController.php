<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use App\Models\Employee;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    use ApiResponse;

    // =========================================================================
    // LOGIN
    // =========================================================================

    /**
     * Authenticate user and issue a Sanctum token.
     *
     * Response: { success, message, data: { user, token } }
     * Frontend stores token in localStorage as "procom_token".
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Create a new Sanctum personal access token
        $token = $user->createToken('procom_token')->plainTextToken;

        return $this->success([
            'user'  => $this->formatUser($user),
            'token' => $token,
        ], 'Login successful');
    }

    // =========================================================================
    // LOGOUT
    // =========================================================================

    /**
     * Revoke the current access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        // currentAccessToken() may be null when using actingAs() in tests
        // or if the guard is not Sanctum (e.g. session auth)
        if ($token) {
            $token->delete();
        }

        return $this->success(null, 'Logged out successfully');
    }

    // =========================================================================
    // AUTHENTICATED USER
    // =========================================================================

    /**
     * Return the authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('employee');

        return $this->success($this->formatUser($user));
    }

    // =========================================================================
    // PROFILE UPDATE
    // =========================================================================

    /**
     * Update authenticated user's own profile fields.
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->only([
            'name',
            'email',
            'phone',
            'position',
        ]);

        // Cari data karyawan yang terhubung dengan akun.
        // Gunakan email sebagai fallback untuk akun lama
        // yang belum memiliki employee_id.
        $employee = $user->employee;

        if (! $employee) {
            $employee = Employee::where('email', $user->email)->first();
        }

        $oldAvatar = $user->avatar;
        $newAvatar = null;

        // Simpan foto baru bila pengguna mengunggahnya.
        if ($request->hasFile('avatar')) {
            $newAvatar = $request->file('avatar')->store(
                'employees',
                'public'
            );

            $data['avatar'] = $newAvatar;
        }

        try {
            DB::transaction(function () use ($user, $employee, $data) {
                // Perbarui akun pengguna.
                $user->update($data);

                // Sinkronkan kolom yang sesuai ke data karyawan.
                if ($employee) {
                    $employeeData = array_intersect_key(
                        $data,
                        array_flip([
                            'name',
                            'email',
                            'phone',
                            'position',
                            'avatar',
                        ])
                    );

                    if (! empty($employeeData)) {
                        $employee->update($employeeData);
                    }
                }
            });
        } catch (\Throwable $error) {
            // Hapus file foto baru jika perubahan database gagal.
            if (
                $newAvatar &&
                Storage::disk('public')->exists($newAvatar)
            ) {
                Storage::disk('public')->delete($newAvatar);
            }

            throw $error;
        }

        // Hapus foto lama setelah perubahan database berhasil.
        if (
            $newAvatar &&
            $oldAvatar &&
            $oldAvatar !== $newAvatar &&
            Storage::disk('public')->exists($oldAvatar)
        ) {
            Storage::disk('public')->delete($oldAvatar);
        }

        $user = $user->fresh()->load('employee');

        return $this->success(
            $this->formatUser($user),
            'Profile updated successfully'
        );
    }

    // =========================================================================
    // CHANGE PASSWORD
    // =========================================================================

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Revoke all existing tokens and issue a fresh one
        $user->tokens()->delete();
        $token = $user->createToken('procom_token')->plainTextToken;

        return $this->success(['token' => $token], 'Password changed successfully');
    }

    // =========================================================================
    // FORGOT PASSWORD
    // =========================================================================

    /**
     * Send a password reset link to the given email address.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return $this->success(null, __($status));
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    // =========================================================================
    // RESET PASSWORD
    // =========================================================================

    /**
     * Reset password using the token sent by email.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->success(null, __($status));
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    // =========================================================================
    // HELPER
    // =========================================================================

    /**
     * Format a user model for API response.
     * Never exposes password or remember_token.
     */
    private function formatUser(User $user): array
    {
        return [
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'phone'       => $user->phone,
            'position'    => $user->position,
            'role'        => $user->role,
            'avatar'      => $user->avatar ? Storage::disk('public')->url($user->avatar) : null,
            'employee_id' => $user->employee_id,
            'created_at'  => $user->created_at,
        ];
    }
}
