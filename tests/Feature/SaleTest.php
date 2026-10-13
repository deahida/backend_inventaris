<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Employee;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Sales / POS API Tests
 *
 * Uses actingAs($user, 'sanctum') for proper middleware resolution in SQLite test env.
 */
class SaleTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $cashier;
    private User $owner;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $adminEmp = Employee::create(['employee_id'=>'EMP-001','name'=>'Admin','email'=>'admin@t.com','phone'=>'081','position'=>'Admin','status'=>'aktif']);
        $this->admin = User::create(['name'=>'Admin','email'=>'admin@t.com','password'=>'Pass@12345','role'=>'admin','employee_id'=>$adminEmp->id]);

        $cashierEmp = Employee::create(['employee_id'=>'EMP-002','name'=>'Cashier','email'=>'cashier@t.com','phone'=>'082','position'=>'Kasir','status'=>'aktif']);
        $this->cashier = User::create(['name'=>'Cashier','email'=>'cashier@t.com','password'=>'Pass@12345','role'=>'cashier','employee_id'=>$cashierEmp->id]);

        $ownerEmp = Employee::create(['employee_id'=>'EMP-003','name'=>'Owner','email'=>'owner@t.com','phone'=>'083','position'=>'Owner','status'=>'aktif']);
        $this->owner = User::create(['name'=>'Owner','email'=>'owner@t.com','password'=>'Pass@12345','role'=>'owner','employee_id'=>$ownerEmp->id]);

        $cat = Category::create(['name'=>'Laptop']);
        $sup = Supplier::create(['code'=>'SUP-001','name'=>'Test Sup','phone'=>'000','email'=>'sup@t.com','address'=>'Addr','contact_person'=>'CP','status'=>'aktif']);
        $this->product = Product::create([
            'code'=>'PRD-00001','name'=>'Laptop Test',
            'category_id'=>$cat->id,'supplier_id'=>$sup->id,
            'purchase_price'=>5000000,'selling_price'=>1000000,
            'stock'=>10,'min_stock'=>2,'condition'=>'baru','status'=>'aktif',
        ]);
    }

    private function salePayload(array $overrides = []): array
    {
        return array_merge([
            'items'          => [['product_id'=>$this->product->id,'quantity'=>3]],
            'payment_method' => 'tunai',
            'payment_amount' => 3000000,
        ], $overrides);
    }

    // ================================================================
    // CREATE SALE — BASIC
    // ================================================================

    public function test_admin_can_create_sale(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sales', $this->salePayload())
            ->assertCreated()
            ->assertJsonPath('success', true);
        $this->assertDatabaseCount('sales', 1);
        $this->assertDatabaseCount('sale_items', 1);
    }

    public function test_cashier_can_create_sale(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/sales', $this->salePayload())
            ->assertCreated();
    }

    public function test_sale_deducts_stock_correctly(): void
    {
        $this->assertEquals(10, $this->product->stock);

        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sales', $this->salePayload())
            ->assertCreated();

        $this->assertEquals(7, $this->product->fresh()->stock);
    }

    public function test_sale_creates_penjualan_stock_transaction(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sales', $this->salePayload())
            ->assertCreated();

        $this->assertDatabaseHas('stock_transactions', [
            'product_id'   => $this->product->id,
            'type'         => 'penjualan',
            'quantity'     => 3,
            'stock_before' => 10,
            'stock_after'  => 7,
        ]);
    }

    public function test_invoice_is_auto_generated(): void
    {
        $resp = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sales', $this->salePayload())
            ->assertCreated();
        $this->assertStringStartsWith('INV-', $resp->json('data.invoice'));
    }

    // ================================================================
    // SERVER-SIDE PRICE CALCULATION — SECURITY
    // ================================================================

    public function test_backend_ignores_manipulated_frontend_price(): void
    {
        // Product selling_price = 1,000,000
        // Frontend tries to pass unit_price = 1 (attempt to cheat)
        $payload = $this->salePayload([
            'items' => [['product_id'=>$this->product->id,'quantity'=>3,'unit_price'=>1]],
            'payment_amount' => 3000000,
        ]);

        $resp = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sales', $payload)
            ->assertCreated();

        // Total must be calculated from DB price (1,000,000 × 3 = 3,000,000)
        $this->assertEquals(3000000, $resp->json('data.total'));
    }

    public function test_sale_rejected_when_payment_less_than_total(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sales', $this->salePayload(['payment_amount' => 100]))
            ->assertStatus(422);

        $this->assertDatabaseCount('sales', 0);
    }

    public function test_sale_rejected_when_product_does_not_exist(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sales', $this->salePayload(['items' => [['product_id'=>9999,'quantity'=>1]]]))
            ->assertStatus(422);
    }

    public function test_sale_rejected_when_quantity_exceeds_stock(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sales', $this->salePayload([
                'items'          => [['product_id'=>$this->product->id,'quantity'=>100]],
                'payment_amount' => 99999999,
            ]))->assertStatus(422);

        $this->assertEquals(10, $this->product->fresh()->stock);
        $this->assertDatabaseCount('sales', 0);
    }

    public function test_sale_rejected_with_invalid_payment_method(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sales', $this->salePayload(['payment_method' => 'bitcoin']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['payment_method']);
    }

    // ================================================================
    // ATOMICITY — Multi-product, one fails
    // ================================================================

    public function test_sale_atomicity_fails_when_one_product_has_insufficient_stock(): void
    {
        $cat = Category::first();
        $sup = Supplier::first();
        $product2 = Product::create([
            'code'=>'PRD-00002','name'=>'Mouse',
            'category_id'=>$cat->id,'supplier_id'=>$sup->id,
            'purchase_price'=>100000,'selling_price'=>150000,
            'stock'=>1,'min_stock'=>1,'condition'=>'baru','status'=>'aktif',
        ]);

        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sales', [
                'items' => [
                    ['product_id'=>$this->product->id,'quantity'=>3],
                    ['product_id'=>$product2->id,'quantity'=>100], // exceeds stock
                ],
                'payment_method' => 'tunai',
                'payment_amount'  => 99999999,
            ])->assertStatus(422);

        // No partial state
        $this->assertEquals(10, $this->product->fresh()->stock);
        $this->assertEquals(1, $product2->fresh()->stock);
        $this->assertDatabaseCount('sales', 0);
        $this->assertDatabaseCount('sale_items', 0);
        $this->assertDatabaseCount('stock_transactions', 0);
    }

    // ================================================================
    // ROLE AUTHORIZATION
    // ================================================================

    public function test_owner_cannot_create_sale(): void
    {
        $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/sales', $this->salePayload())
            ->assertStatus(403);
    }

    public function test_all_roles_can_list_sales(): void
    {
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/sales')->assertOk();
        $this->actingAs($this->cashier, 'sanctum')->getJson('/api/sales')->assertOk();
        $this->actingAs($this->owner, 'sanctum')->getJson('/api/sales')->assertOk();
    }

    // ================================================================
    // CANCELLATION
    // ================================================================

    public function test_admin_can_cancel_sale_and_stock_is_restored(): void
    {
        $resp = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sales', $this->salePayload())
            ->assertCreated();
        $saleId = $resp->json('data.id');

        $this->assertEquals(7, $this->product->fresh()->stock);

        $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/sales/{$saleId}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'dibatalkan');

        $this->assertEquals(10, $this->product->fresh()->stock);

        // Restoration transaction exists
        $this->assertDatabaseHas('stock_transactions', [
            'product_id' => $this->product->id,
            'type'       => 'penyesuaian',
        ]);

        // Sale still in DB (not deleted)
        $this->assertDatabaseHas('sales', ['id'=>$saleId,'status'=>'dibatalkan']);
    }

    public function test_cancelled_sale_cannot_be_cancelled_again(): void
    {
        $resp = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sales', $this->salePayload())
            ->assertCreated();
        $saleId = $resp->json('data.id');

        $this->actingAs($this->admin, 'sanctum')->patchJson("/api/sales/{$saleId}/cancel")->assertOk();
        $this->actingAs($this->admin, 'sanctum')->patchJson("/api/sales/{$saleId}/cancel")->assertStatus(409);
    }

    public function test_cashier_cannot_cancel_sale(): void
    {
        $resp = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sales', $this->salePayload())
            ->assertCreated();
        $saleId = $resp->json('data.id');

        $this->actingAs($this->cashier, 'sanctum')
            ->patchJson("/api/sales/{$saleId}/cancel")
            ->assertStatus(403);
    }

    public function test_owner_cannot_cancel_sale(): void
    {
        $resp = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sales', $this->salePayload())
            ->assertCreated();
        $saleId = $resp->json('data.id');

        $this->actingAs($this->owner, 'sanctum')
            ->patchJson("/api/sales/{$saleId}/cancel")
            ->assertStatus(403);
    }

    public function test_unauthenticated_cannot_create_sale(): void
    {
        $this->postJson('/api/sales', $this->salePayload())->assertStatus(401);
    }
}
