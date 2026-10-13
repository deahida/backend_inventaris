<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Employee;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    private Category $cat;
    private Supplier $sup;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->cat = Category::create(['name'=>'Laptop']);
        $this->sup = Supplier::create(['code'=>'SUP-001','name'=>'Test Sup','phone'=>'000','email'=>'sup@t.com','address'=>'Addr','contact_person'=>'CP','status'=>'aktif']);
    }

    private function makeUser(string $role, string $empId, string $email): User
    {
        $emp = Employee::create(['employee_id'=>$empId,'name'=>ucfirst($role),'email'=>$email,'phone'=>'08x','position'=>ucfirst($role),'status'=>'aktif']);
        return User::create(['name'=>ucfirst($role),'email'=>$email,'password'=>'Pass@12345','role'=>$role,'employee_id'=>$emp->id]);
    }

    private function productData(array $overrides = []): array
    {
        return array_merge([
            'name'           => 'Laptop Test',
            'category_id'    => $this->cat->id,
            'supplier_id'    => $this->sup->id,
            'purchase_price' => 5000000,
            'selling_price'  => 6000000,
            'stock'          => 10,
            'min_stock'      => 3,
            'condition'      => 'baru',
            'status'         => 'aktif',
        ], $overrides);
    }

    private function makeProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'code'           => 'PRD-00001',
            'name'           => 'Laptop Test',
            'category_id'    => $this->cat->id,
            'supplier_id'    => $this->sup->id,
            'purchase_price' => 5000000,
            'selling_price'  => 6000000,
            'stock'          => 10,
            'min_stock'      => 3,
            'condition'      => 'baru',
            'status'         => 'aktif',
        ], $overrides));
    }

    public function test_admin_can_create_product(): void
    {
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/products', $this->productData())
            ->assertCreated()
            ->assertJsonPath('data.name', 'Laptop Test');
        $this->assertDatabaseHas('products', ['name'=>'Laptop Test']);
    }

    public function test_product_code_is_auto_generated(): void
    {
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $resp = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/products', $this->productData())
            ->assertCreated();
        $this->assertStringStartsWith('PRD-', $resp->json('data.code'));
    }

    public function test_admin_can_list_products(): void
    {
        $this->makeProduct();
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $this->actingAs($admin, 'sanctum')->getJson('/api/products')->assertOk();
    }

    public function test_owner_can_read_products(): void
    {
        $this->makeProduct();
        $owner = $this->makeUser('owner','EMP-003','owner@t.com');
        $this->actingAs($owner, 'sanctum')->getJson('/api/products')->assertOk();
    }

    public function test_cashier_cannot_manage_products(): void
    {
        $cashier = $this->makeUser('cashier','EMP-002','cashier@t.com');
        $this->actingAs($cashier, 'sanctum')->getJson('/api/products')->assertStatus(403);
        $this->actingAs($cashier, 'sanctum')->postJson('/api/products', $this->productData())->assertStatus(403);
    }

    public function test_owner_cannot_create_product(): void
    {
        $owner = $this->makeUser('owner','EMP-003','owner@t.com');
        $this->actingAs($owner, 'sanctum')->postJson('/api/products', $this->productData())->assertStatus(403);
    }

    public function test_admin_can_update_product(): void
    {
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $prod = $this->makeProduct();
        $this->actingAs($admin, 'sanctum')
            ->putJson('/api/products/'.$prod->id, $this->productData(['name'=>'Updated Laptop']))
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Laptop');
    }

    public function test_admin_can_delete_product(): void
    {
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $prod = $this->makeProduct();
        $this->actingAs($admin, 'sanctum')->deleteJson('/api/products/'.$prod->id)->assertOk();
        $this->assertDatabaseMissing('products', ['id'=>$prod->id]);
    }

    public function test_nonexistent_product_returns_404(): void
    {
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $this->actingAs($admin, 'sanctum')->getJson('/api/products/9999')->assertStatus(404);
    }

    public function test_invalid_category_rejected(): void
    {
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/products', $this->productData(['category_id'=>9999]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['category_id']);
    }

    public function test_invalid_supplier_rejected(): void
    {
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/products', $this->productData(['supplier_id'=>9999]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['supplier_id']);
    }

    public function test_negative_stock_rejected(): void
    {
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/products', $this->productData(['stock'=>-1]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['stock']);
    }

    public function test_invalid_condition_rejected(): void
    {
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/products', $this->productData(['condition'=>'broken']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['condition']);
    }

    public function test_product_image_can_be_uploaded(): void
    {
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $file = UploadedFile::fake()->image('product.jpg', 100, 100)->size(500);
        $resp = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/products', array_merge($this->productData(), ['image'=>$file]))
            ->assertCreated();
        $this->assertNotNull($resp->json('data.image'));
        Storage::disk('public')->assertExists('products/' . basename($resp->json('data.image')));
    }

    public function test_product_search_filter_works(): void
    {
        $this->makeProduct(['code'=>'PRD-00001','name'=>'Laptop ASUS']);
        Product::create(array_merge($this->productData(), ['code'=>'PRD-00002','name'=>'Mouse Logitech']));
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $resp = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/products?search=ASUS')
            ->assertOk();
        $this->assertCount(1, $resp->json('data.data'));
    }

    public function test_product_status_filter_works(): void
    {
        $this->makeProduct(['code'=>'PRD-00001','status'=>'aktif']);
        Product::create(array_merge($this->productData(), ['code'=>'PRD-00002','status'=>'nonaktif']));
        $admin = $this->makeUser('admin','EMP-001','admin@t.com');
        $resp = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/products?status=nonaktif')
            ->assertOk();
        $this->assertCount(1, $resp->json('data.data'));
    }
}
