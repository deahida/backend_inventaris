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
 * Dashboard & Report API Tests
 *
 * Uses actingAs($user, 'sanctum') for proper middleware resolution.
 *
 * Dashboard stats keys (from DashboardController):
 *   total_revenue, total_revenue_growth, total_sales, total_sales_growth,
 *   total_products, available_products, low_stock_count, total_employees,
 *   today_revenue, today_transactions
 *
 * Report structure (from ReportController):
 *   Sales: summary, daily_trend, top_products
 *   Inventory: summary, category_breakdown, low_stock_products
 *   Attendance: month, period, report
 */
class DashboardReportTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $cashier;
    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();

        $adminEmp = Employee::create(['employee_id'=>'EMP-001','name'=>'Admin','email'=>'admin@t.com','phone'=>'081','position'=>'Admin','status'=>'aktif']);
        $this->admin = User::create(['name'=>'Admin','email'=>'admin@t.com','password'=>'Pass@12345','role'=>'admin','employee_id'=>$adminEmp->id]);

        $cashierEmp = Employee::create(['employee_id'=>'EMP-002','name'=>'Cashier','email'=>'cashier@t.com','phone'=>'082','position'=>'Kasir','status'=>'aktif']);
        $this->cashier = User::create(['name'=>'Cashier','email'=>'cashier@t.com','password'=>'Pass@12345','role'=>'cashier','employee_id'=>$cashierEmp->id]);

        $ownerEmp = Employee::create(['employee_id'=>'EMP-003','name'=>'Owner','email'=>'owner@t.com','phone'=>'083','position'=>'Owner','status'=>'aktif']);
        $this->owner = User::create(['name'=>'Owner','email'=>'owner@t.com','password'=>'Pass@12345','role'=>'owner','employee_id'=>$ownerEmp->id]);
    }

    // ================================================================
    // DASHBOARD ENDPOINTS — ALL THREE ROLES
    // ================================================================

    public function test_admin_can_access_dashboard_stats(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/dashboard/stats')
            ->assertOk()
            ->assertJsonPath('success', true)
            // Keys from DashboardController::stats()
            ->assertJsonStructure(['data' => ['total_products', 'total_employees', 'total_revenue', 'low_stock_count']]);
    }

    public function test_cashier_can_access_dashboard_stats(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->getJson('/api/dashboard/stats')
            ->assertOk();
    }

    public function test_owner_can_access_dashboard_stats(): void
    {
        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/dashboard/stats')
            ->assertOk();
    }

    public function test_unauthenticated_cannot_access_dashboard(): void
    {
        $this->getJson('/api/dashboard/stats')->assertStatus(401);
    }

    public function test_admin_can_access_monthly_sales(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/dashboard/monthly-sales')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_access_weekly_sales(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/dashboard/weekly-sales')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_access_category_distribution(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/dashboard/category-distribution')
            ->assertOk();
    }

    public function test_admin_can_access_attendance_summary(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/dashboard/attendance-summary')
            ->assertOk();
    }

    public function test_admin_can_access_low_stock_products(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/dashboard/low-stock-products')
            ->assertOk();
    }

    public function test_admin_can_access_recent_transactions(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/dashboard/recent-transactions')
            ->assertOk();
    }

    public function test_dashboard_stats_reflect_seeded_data(): void
    {
        $cat = Category::create(['name'=>'Laptop']);
        $sup = Supplier::create(['code'=>'SUP-001','name'=>'S','phone'=>'0','email'=>'s@t.com','address'=>'A','contact_person'=>'C','status'=>'aktif']);
        Product::create([
            'code'=>'PRD-00001','name'=>'Laptop Test',
            'category_id'=>$cat->id,'supplier_id'=>$sup->id,
            'purchase_price'=>5000000,'selling_price'=>6000000,
            'stock'=>10,'min_stock'=>2,'condition'=>'baru','status'=>'aktif',
        ]);

        $resp = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/dashboard/stats')
            ->assertOk();

        // Verify actual keys from DashboardController
        $this->assertEquals(1, $resp->json('data.total_products'));
        // Admin + cashier + owner = 3 active employees from setUp
        $this->assertEquals(3, $resp->json('data.total_employees'));
    }

    // ================================================================
    // REPORT ENDPOINTS
    // ================================================================

    public function test_admin_can_access_sales_report(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/reports/sales')
            ->assertOk();
    }

    public function test_owner_can_access_sales_report(): void
    {
        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/reports/sales')
            ->assertOk();
    }

    public function test_cashier_cannot_access_reports(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->getJson('/api/reports/sales')
            ->assertStatus(403);
        $this->actingAs($this->cashier, 'sanctum')
            ->getJson('/api/reports/inventory')
            ->assertStatus(403);
        $this->actingAs($this->cashier, 'sanctum')
            ->getJson('/api/reports/attendance')
            ->assertStatus(403);
    }

    public function test_admin_can_access_inventory_report(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/reports/inventory')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_access_attendance_report(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/reports/attendance')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_sales_report_has_expected_structure(): void
    {
        $resp = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/reports/sales')
            ->assertOk();

        // From ReportController::sales()
        $this->assertArrayHasKey('summary', $resp->json('data'));
        $this->assertArrayHasKey('daily_trend', $resp->json('data'));
        $this->assertArrayHasKey('top_products', $resp->json('data'));
    }

    public function test_inventory_report_has_expected_structure(): void
    {
        $resp = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/reports/inventory')
            ->assertOk();

        // From ReportController::inventory() — actual keys
        $this->assertArrayHasKey('summary', $resp->json('data'));
        $this->assertArrayHasKey('category_breakdown', $resp->json('data'));
        $this->assertArrayHasKey('low_stock_products', $resp->json('data'));
    }

    public function test_attendance_report_has_expected_structure(): void
    {
        $resp = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/reports/attendance?month=' . now()->format('Y-m'))
            ->assertOk();

        // From ReportController::attendance()
        $this->assertArrayHasKey('month', $resp->json('data'));
        $this->assertArrayHasKey('period', $resp->json('data'));
        $this->assertArrayHasKey('report', $resp->json('data'));
    }
}
