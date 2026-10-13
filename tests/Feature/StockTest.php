<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Employee;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockTest extends TestCase
{
    use RefreshDatabase;

    private Employee $emp;
    private User $admin;
    private User $cashier;
    private Product $product;
    private Supplier $supplier;

    protected function setUp(): void
    {
        parent::setUp();
        $this->emp = Employee::create(['employee_id'=>'EMP-001','name'=>'Admin','email'=>'admin@t.com','phone'=>'081','position'=>'Admin','status'=>'aktif']);
        $this->admin = User::create(['name'=>'Admin','email'=>'admin@t.com','password'=>'Pass@12345','role'=>'admin','employee_id'=>$this->emp->id]);

        $cashierEmp = Employee::create(['employee_id'=>'EMP-002','name'=>'Cashier','email'=>'cashier@t.com','phone'=>'082','position'=>'Kasir','status'=>'aktif']);
        $this->cashier = User::create(['name'=>'Cashier','email'=>'cashier@t.com','password'=>'Pass@12345','role'=>'cashier','employee_id'=>$cashierEmp->id]);

        $cat = Category::create(['name'=>'Laptop']);
        $this->supplier = Supplier::create(['code'=>'SUP-001','name'=>'Test Sup','phone'=>'000','email'=>'sup@t.com','address'=>'Addr','contact_person'=>'CP','status'=>'aktif']);
        $this->product = Product::create([
            'code'=>'PRD-00001','name'=>'Laptop Test',
            'category_id'=>$cat->id,'supplier_id'=>$this->supplier->id,
            'purchase_price'=>5000000,'selling_price'=>6000000,
            'stock'=>3,'min_stock'=>2,'condition'=>'baru','status'=>'aktif',
        ]);
    }

    // ============================================================
    // STOCK IN TESTS
    // ============================================================

    public function test_stock_in_increases_product_stock(): void
    {
        $this->assertEquals(3, $this->product->stock);

        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/stock-in', [
                'supplier_id' => $this->supplier->id,
                'date'        => now()->format('Y-m-d'),
                'items'       => [['product_id'=>$this->product->id,'quantity'=>7,'unit_price'=>5000000]],
            ])->assertCreated();

        $this->assertEquals(10, $this->product->fresh()->stock);
    }

    public function test_stock_in_creates_stock_transaction(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/stock-in', [
                'supplier_id' => $this->supplier->id,
                'date'        => now()->format('Y-m-d'),
                'items'       => [['product_id'=>$this->product->id,'quantity'=>7,'unit_price'=>5000000]],
            ])->assertCreated();

        $this->assertDatabaseHas('stock_transactions', [
            'product_id'  => $this->product->id,
            'type'        => 'masuk',
            'quantity'    => 7,
            'stock_before'=> 3,
            'stock_after' => 10,
        ]);
    }

    public function test_stock_in_atomicity_fails_on_invalid_product(): void
    {
        // Invalid product_id in items should fail validation
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/stock-in', [
                'supplier_id' => $this->supplier->id,
                'date'        => now()->format('Y-m-d'),
                'items'       => [
                    ['product_id'=>$this->product->id,'quantity'=>5,'unit_price'=>5000000],
                    ['product_id'=>9999,'quantity'=>3,'unit_price'=>1000], // invalid
                ],
            ])->assertStatus(422);

        // Stock must remain 3
        $this->assertEquals(3, $this->product->fresh()->stock);
        $this->assertDatabaseCount('stock_in_headers', 0);
        $this->assertDatabaseCount('stock_transactions', 0);
    }

    public function test_cashier_cannot_create_stock_in(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/stock-in', [
                'supplier_id'=>$this->supplier->id,'date'=>now()->format('Y-m-d'),
                'items'=>[['product_id'=>$this->product->id,'quantity'=>1,'unit_price'=>5000000]],
            ])->assertStatus(403);
    }

    public function test_admin_can_list_stock_in(): void
    {
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/stock-in')->assertOk();
    }

    // ============================================================
    // STOCK OUT TESTS
    // ============================================================

    public function test_stock_out_decreases_product_stock(): void
    {
        $this->product->update(['stock'=>10]);

        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/stock-out', [
                'product_id' => $this->product->id,
                'quantity'   => 3,
                'date'       => now()->format('Y-m-d'),
                'reason'     => 'Barang rusak',
            ])->assertCreated();

        $this->assertEquals(7, $this->product->fresh()->stock);
    }

    public function test_stock_out_creates_keluar_transaction(): void
    {
        $this->product->update(['stock'=>10]);

        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/stock-out', [
                'product_id' => $this->product->id,
                'quantity'   => 3,
                'date'       => now()->format('Y-m-d'),
                'reason'     => 'Barang rusak',
            ])->assertCreated();

        $this->assertDatabaseHas('stock_transactions', [
            'product_id'   => $this->product->id,
            'type'         => 'keluar',
            'quantity'     => 3,
            'stock_before' => 10,
            'stock_after'  => 7,
        ]);
    }

    public function test_stock_out_fails_when_insufficient_stock(): void
    {
        // Product has stock = 3
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/stock-out', [
                'product_id' => $this->product->id,
                'quantity'   => 20,
                'date'       => now()->format('Y-m-d'),
                'reason'     => 'Test',
            ])->assertStatus(422);

        // Stock remains 3
        $this->assertEquals(3, $this->product->fresh()->stock);
        $this->assertDatabaseCount('stock_transactions', 0);
    }

    public function test_cashier_cannot_create_stock_out(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/stock-out', [
                'product_id'=>$this->product->id,'quantity'=>1,
                'date'=>now()->format('Y-m-d'),'reason'=>'Test',
            ])->assertStatus(403);
    }

    // ============================================================
    // STOCK TRANSACTIONS TESTS
    // ============================================================

    public function test_admin_can_list_stock_transactions(): void
    {
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/stock-transactions')->assertOk();
    }

    public function test_cashier_cannot_access_stock_transactions(): void
    {
        $this->actingAs($this->cashier, 'sanctum')->getJson('/api/stock-transactions')->assertStatus(403);
    }
}
