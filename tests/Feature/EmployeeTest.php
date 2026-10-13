<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Employee API Tests
 *
 * Uses actingAs($user, 'sanctum') for proper middleware resolution.
 * Delete employee = soft deactivation (status = 'nonaktif'), not physical delete.
 */
class EmployeeTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $cashier;
    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();
        \Illuminate\Support\Facades\Storage::fake('public');

        $adminEmp = Employee::create(['employee_id'=>'EMP-001','name'=>'Admin','email'=>'admin@t.com','phone'=>'081','position'=>'Admin','status'=>'aktif']);
        $this->admin = User::create(['name'=>'Admin','email'=>'admin@t.com','password'=>'Pass@12345','role'=>'admin','employee_id'=>$adminEmp->id]);

        $cashierEmp = Employee::create(['employee_id'=>'EMP-002','name'=>'Cashier','email'=>'cashier@t.com','phone'=>'082','position'=>'Kasir','status'=>'aktif']);
        $this->cashier = User::create(['name'=>'Cashier','email'=>'cashier@t.com','password'=>'Pass@12345','role'=>'cashier','employee_id'=>$cashierEmp->id]);

        $ownerEmp = Employee::create(['employee_id'=>'EMP-003','name'=>'Owner','email'=>'owner@t.com','phone'=>'083','position'=>'Owner','status'=>'aktif']);
        $this->owner = User::create(['name'=>'Owner','email'=>'owner@t.com','password'=>'Pass@12345','role'=>'owner','employee_id'=>$ownerEmp->id]);
    }

    private static int $empCounter = 10;

    private function employeePayload(array $overrides = []): array
    {
        $n = self::$empCounter++;
        return array_merge([
            'name'      => 'New Employee',
            'email'     => "emp{$n}@t.com",
            'phone'     => '089999999',
            'position'  => 'Staff',
            'join_date' => '2024-01-01',
            'status'    => 'aktif',
        ], $overrides);
    }

    public function test_admin_can_create_employee(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/employees', $this->employeePayload())
            ->assertCreated()
            ->assertJsonPath('data.name', 'New Employee');
        $this->assertDatabaseHas('employees', ['name'=>'New Employee']);
    }

    public function test_employee_id_is_auto_generated(): void
    {
        $resp = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/employees', $this->employeePayload())
            ->assertCreated();
        $this->assertStringStartsWith('EMP-', $resp->json('data.employee_id'));
    }

    public function test_admin_can_list_employees(): void
    {
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/employees')->assertOk();
    }

    public function test_owner_can_list_employees(): void
    {
        $this->actingAs($this->owner, 'sanctum')->getJson('/api/employees')->assertOk();
    }

    public function test_cashier_cannot_access_employees(): void
    {
        $this->actingAs($this->cashier, 'sanctum')->getJson('/api/employees')->assertStatus(403);
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/employees', $this->employeePayload())
            ->assertStatus(403);
    }

    public function test_owner_cannot_create_employee(): void
    {
        $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/employees', $this->employeePayload())
            ->assertStatus(403);
    }

    public function test_admin_can_show_employee(): void
    {
        $emp = Employee::where('employee_id','EMP-001')->first();
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/employees/'.$emp->id)
            ->assertOk();
    }

    public function test_admin_can_update_employee(): void
    {
        $emp = Employee::where('employee_id','EMP-001')->first();
        $this->actingAs($this->admin, 'sanctum')
            ->putJson('/api/employees/'.$emp->id, $this->employeePayload(['name'=>'Updated Name','email'=>$emp->email]))
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Name');
    }

    public function test_admin_can_deactivate_employee(): void
    {
        $resp = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/employees', $this->employeePayload())
            ->assertCreated();
        $empId = $resp->json('data.id');

        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson('/api/employees/'.$empId)
            ->assertOk();

        // Employee deactivated, not deleted
        $this->assertDatabaseHas('employees', ['id'=>$empId,'status'=>'nonaktif']);
    }

    public function test_duplicate_email_is_rejected(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/employees', $this->employeePayload(['email'=>'admin@t.com']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_nonexistent_employee_returns_404(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/employees/9999')
            ->assertStatus(404);
    }

    public function test_employee_avatar_can_be_uploaded(): void
    {
        $resp = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/employees', array_merge(
                $this->employeePayload(),
                ['avatar' => \Illuminate\Http\UploadedFile::fake()->image('avatar.jpg',100,100)->size(200)]
            ))
            ->assertCreated();
        $this->assertNotNull($resp->json('data.avatar'));
        \Illuminate\Support\Facades\Storage::disk('public')
            ->assertExists('employees/' . basename($resp->json('data.avatar')));
    }
}
