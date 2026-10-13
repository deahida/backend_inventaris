<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Authentication API Tests
 *
 * Covers: login, logout, me, profile update, password change.
 *
 * Notes:
 * - Laravel's AuthController throws ValidationException on wrong credentials → 422
 * - All tests use actingAs($user, 'sanctum') for proper middleware resolution in SQLite test env
 */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    private function makeEmployee(array $overrides = []): Employee
    {
        return Employee::create(array_merge([
            'employee_id' => 'EMP-001',
            'name'        => 'Ahmad Fauzi',
            'email'       => 'admin@procom.test',
            'phone'       => '081234567890',
            'position'    => 'Administrator',
            'status'      => 'aktif',
        ], $overrides));
    }

    private function makeUser(array $overrides = []): User
    {
        $emp = $this->makeEmployee();
        return User::create(array_merge([
            'name'        => 'Ahmad Fauzi',
            'email'       => 'admin@procom.test',
            'password'    => Hash::make('Admin@12345'),
            'role'        => 'admin',
            'employee_id' => $emp->id,
        ], $overrides));
    }

    // ================================================================
    // LOGIN TESTS
    // ================================================================

    public function test_admin_can_login_successfully(): void
    {
        $this->makeUser(['role' => 'admin']);

        $this->postJson('/api/auth/login', [
            'email'    => 'admin@procom.test',
            'password' => 'Admin@12345',
        ])
            ->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'role'],
                    'token',
                ],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'admin');
    }

    public function test_cashier_can_login_successfully(): void
    {
        Employee::create([
            'employee_id' => 'EMP-002', 'name' => 'Siti', 'email' => 'cashier@procom.test',
            'phone' => '082345678901', 'position' => 'Kasir', 'status' => 'aktif',
        ]);
        User::create([
            'name' => 'Siti', 'email' => 'cashier@procom.test',
            'password' => Hash::make('Cashier@12345'), 'role' => 'cashier',
        ]);

        $this->postJson('/api/auth/login', ['email' => 'cashier@procom.test', 'password' => 'Cashier@12345'])
            ->assertOk()
            ->assertJsonPath('data.user.role', 'cashier');
    }

    public function test_owner_can_login_successfully(): void
    {
        Employee::create([
            'employee_id' => 'EMP-003', 'name' => 'Budi', 'email' => 'owner@procom.test',
            'phone' => '083456789012', 'position' => 'Pemilik', 'status' => 'aktif',
        ]);
        User::create([
            'name' => 'Budi', 'email' => 'owner@procom.test',
            'password' => Hash::make('Owner@12345'), 'role' => 'owner',
        ]);

        $this->postJson('/api/auth/login', ['email' => 'owner@procom.test', 'password' => 'Owner@12345'])
            ->assertOk()
            ->assertJsonPath('data.user.role', 'owner');
    }

    /**
     * Wrong password → ValidationException → 422
     * (Laravel/Fortify convention: credential errors are validation errors on the email field)
     */
    public function test_login_fails_with_wrong_password(): void
    {
        $this->makeUser();

        $this->postJson('/api/auth/login', ['email' => 'admin@procom.test', 'password' => 'WrongPass!'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_fails_with_unknown_email(): void
    {
        $this->postJson('/api/auth/login', ['email' => 'nobody@procom.test', 'password' => 'SomePass@1'])
            ->assertStatus(422);
    }

    public function test_login_fails_with_missing_email(): void
    {
        $this->postJson('/api/auth/login', ['password' => 'Admin@12345'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_fails_with_missing_password(): void
    {
        $this->postJson('/api/auth/login', ['email' => 'admin@procom.test'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_login_response_never_exposes_password(): void
    {
        $this->makeUser();
        $response = $this->postJson('/api/auth/login', ['email' => 'admin@procom.test', 'password' => 'Admin@12345']);
        $response->assertOk();
        $this->assertArrayNotHasKey('password', $response->json('data.user'));
    }

    public function test_login_response_contains_required_structure(): void
    {
        $this->makeUser();
        $this->postJson('/api/auth/login', ['email' => 'admin@procom.test', 'password' => 'Admin@12345'])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['user', 'token']]);
    }

    // ================================================================
    // ME TESTS
    // ================================================================

    public function test_me_returns_authenticated_user(): void
    {
        $user = $this->makeUser();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'admin@procom.test')
            ->assertJsonMissing(['password']);
    }

    public function test_me_returns_401_when_unauthenticated(): void
    {
        $this->getJson('/api/auth/me')->assertStatus(401);
    }

    // ================================================================
    // LOGOUT TESTS
    // ================================================================

    public function test_authenticated_user_can_logout(): void
    {
        $user = $this->makeUser();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    // ================================================================
    // PROFILE UPDATE TESTS
    // ================================================================

    public function test_authenticated_user_can_update_profile(): void
    {
        $user = $this->makeUser();

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/auth/profile', [
                'name'  => 'Ahmad Fauzi Updated',
                'email' => 'admin@procom.test',
                'phone' => '081111111111',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Ahmad Fauzi Updated');
    }

    public function test_profile_update_fails_with_duplicate_email(): void
    {
        // Create second user
        Employee::create([
            'employee_id' => 'EMP-004', 'name' => 'Other', 'email' => 'other@procom.test',
            'phone' => '089999999999', 'position' => 'Staff', 'status' => 'aktif',
        ]);
        User::create([
            'name' => 'Other', 'email' => 'other@procom.test',
            'password' => Hash::make('Other@12345'), 'role' => 'cashier',
        ]);

        $user = $this->makeUser();

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/auth/profile', [
                'name'  => 'Ahmad',
                'email' => 'other@procom.test', // taken
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // ================================================================
    // PASSWORD CHANGE TESTS
    // ================================================================

    public function test_user_can_change_password(): void
    {
        // Must use plain password (not pre-hashed) because User model has 'hashed' cast
        $user = User::create([
            'name'        => 'Admin',
            'email'       => 'admin2@procom.test',
            'password'    => 'Admin@12345', // cast will hash it
            'role'        => 'admin',
        ]);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/auth/password', [
                'current_password'      => 'Admin@12345',
                'password'              => 'NewPass@12345',
                'password_confirmation' => 'NewPass@12345',
            ])
            ->assertOk();
    }

    public function test_password_change_fails_with_wrong_current_password(): void
    {
        $user = User::create([
            'name' => 'Admin2', 'email' => 'admin3@procom.test',
            'password' => 'Admin@12345', 'role' => 'admin',
        ]);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/auth/password', [
                'current_password'      => 'WrongPass!',
                'password'              => 'NewPass@12345',
                'password_confirmation' => 'NewPass@12345',
            ])
            ->assertStatus(422);
    }

    public function test_password_change_fails_when_confirmation_doesnt_match(): void
    {
        $user = User::create([
            'name' => 'Admin4', 'email' => 'admin4@procom.test',
            'password' => 'Admin@12345', 'role' => 'admin',
        ]);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/auth/password', [
                'current_password'      => 'Admin@12345',
                'password'              => 'NewPass@12345',
                'password_confirmation' => 'DifferentPass@1',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }
}
