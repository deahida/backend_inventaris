<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Employee;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, string $empId, string $email): User
    {
        $emp = Employee::create(['employee_id'=>$empId,'name'=>ucfirst($role),'email'=>$email,'phone'=>'08x','position'=>ucfirst($role),'status'=>'aktif']);
        return User::create(['name'=>ucfirst($role),'email'=>$email,'password'=>'Pass@12345','role'=>$role,'employee_id'=>$emp->id]);
    }

    public function test_admin_can_list_categories(): void
    {
        Category::create(['name'=>'Laptop','description'=>'Test']);
        $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->getJson('/api/categories')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_create_category(): void
    {
        $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->postJson('/api/categories', ['name'=>'Laptop','description'=>'Test'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Laptop');
        $this->assertDatabaseHas('categories', ['name'=>'Laptop']);
    }

    public function test_admin_can_show_category(): void
    {
        $cat = Category::create(['name'=>'Monitor']);
        $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->getJson('/api/categories/'.$cat->id)
            ->assertOk()
            ->assertJsonPath('data.name', 'Monitor');
    }

    public function test_admin_can_update_category(): void
    {
        $cat = Category::create(['name'=>'OldName']);
        $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->putJson('/api/categories/'.$cat->id, ['name'=>'NewName'])
            ->assertOk()
            ->assertJsonPath('data.name', 'NewName');
    }

    public function test_admin_can_delete_category_without_products(): void
    {
        $cat = Category::create(['name'=>'Empty']);
        $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->deleteJson('/api/categories/'.$cat->id)
            ->assertOk();
        $this->assertDatabaseMissing('categories', ['id'=>$cat->id]);
    }

    public function test_cannot_delete_category_with_products(): void
    {
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $sup = Supplier::create(['code'=>'SUP-001','name'=>'Sup','phone'=>'000','email'=>'sup@t.com','address'=>'Addr','contact_person'=>'CP','status'=>'aktif']);
        $cat = Category::create(['name'=>'HasProducts']);
        Product::create([
            'code'=>'PRD-00001','name'=>'Test Product',
            'category_id'=>$cat->id,'supplier_id'=>$sup->id,
            'purchase_price'=>1000,'selling_price'=>1200,
            'stock'=>5,'min_stock'=>2,'condition'=>'baru','status'=>'aktif',
        ]);
        $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/categories/'.$cat->id)
            ->assertStatus(409);
        $this->assertDatabaseHas('categories', ['id'=>$cat->id]);
    }

    public function test_duplicate_category_name_is_rejected(): void
    {
        Category::create(['name'=>'Laptop']);
        $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->postJson('/api/categories', ['name'=>'Laptop'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_category_list_includes_product_count(): void
    {
        Category::create(['name'=>'Laptop']);
        $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->getJson('/api/categories')
            ->assertOk()
            ->assertJsonFragment(['product_count'=>0]);
    }

    public function test_nonexistent_category_returns_404(): void
    {
        $this->actingAs($this->makeUser('admin','EMP-001','admin@t.com'), 'sanctum')
            ->getJson('/api/categories/9999')
            ->assertStatus(404);
    }

    public function test_cashier_cannot_access_categories(): void
    {
        $this->actingAs($this->makeUser('cashier','EMP-001','cashier@t.com'), 'sanctum')
            ->getJson('/api/categories')
            ->assertStatus(403);
    }

    public function test_owner_cannot_access_categories(): void
    {
        $this->actingAs($this->makeUser('owner','EMP-001','owner@t.com'), 'sanctum')
            ->getJson('/api/categories')
            ->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_categories(): void
    {
        $this->getJson('/api/categories')->assertStatus(401);
    }
}
