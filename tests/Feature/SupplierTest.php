<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, string $empId, string $email): User
    {
        $emp = Employee::create(['employee_id'=>$empId,'name'=>ucfirst($role),'email'=>$email,'phone'=>'08x','position'=>ucfirst($role),'status'=>'aktif']);
        return User::create(['name'=>ucfirst($role),'email'=>$email,'password'=>'Pass@12345','role'=>$role,'employee_id'=>$emp->id]);
    }

    private function supplierData(array $overrides = []): array
    {
        return array_merge([
            'name'           => 'PT. Test Supplier',
            'phone'          => '021-1234567',
            'email'          => 'test@supplier.com',
            'address'        => 'Jl. Test No.1',
            'contact_person' => 'John Doe',
            'status'         => 'aktif',
        ], $overrides);
    }

    public function test_admin_can_create_supplier(): void
    {
        $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->postJson('/api/suppliers', $this->supplierData())
            ->assertCreated()
            ->assertJsonPath('data.name', 'PT. Test Supplier');
        $this->assertDatabaseHas('suppliers', ['name'=>'PT. Test Supplier']);
    }

    public function test_supplier_code_is_auto_generated(): void
    {
        $resp = $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->postJson('/api/suppliers', $this->supplierData())
            ->assertCreated();
        $this->assertStringStartsWith('SUP-', $resp->json('data.code'));
    }

    public function test_admin_can_list_suppliers(): void
    {
        $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->getJson('/api/suppliers')
            ->assertOk();
    }

    public function test_admin_can_update_supplier(): void
    {
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $sup = Supplier::create(array_merge($this->supplierData(), ['code'=>'SUP-001']));
        $this->actingAs($admin, 'sanctum')
            ->putJson('/api/suppliers/'.$sup->id, array_merge($this->supplierData(), ['name'=>'Updated Supplier']))
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Supplier');
    }

    public function test_admin_can_delete_supplier_without_references(): void
    {
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $sup = Supplier::create(array_merge($this->supplierData(), ['code'=>'SUP-001']));
        $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/suppliers/'.$sup->id)
            ->assertOk();
        $this->assertDatabaseMissing('suppliers', ['id'=>$sup->id]);
    }

    public function test_nonexistent_supplier_returns_404(): void
    {
        $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->getJson('/api/suppliers/9999')
            ->assertStatus(404);
    }

    public function test_cashier_cannot_manage_suppliers(): void
    {
        $this->actingAs($this->makeUser('cashier','EMP-001','cashier@t.com'), 'sanctum')
            ->getJson('/api/suppliers')
            ->assertStatus(403);
    }

    public function test_invalid_supplier_status_rejected(): void
    {
        $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->postJson('/api/suppliers', ['name'=>'Test','status'=>'unknown_status'])
            ->assertStatus(422);
    }
}
