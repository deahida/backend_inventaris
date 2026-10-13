<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockTransaction;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Summary statistics cards:
     * - total_revenue (all time), total_revenue_growth (vs last month)
     * - total_sales, total_sales_growth
     * - total_products
     * - low_stock_count
     * - total_employees (active)
     * - today_revenue
     * - today_transactions
     * - available_products (status = aktif)
     */
    public function stats(): JsonResponse
    {
        $today      = now()->toDateString();
        $thisMonth  = now()->startOfMonth();
        $lastMonth  = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();

        // Revenue this month vs last month
        $thisMonthRevenue = Sale::where('status', 'selesai')
            ->whereDate('date', '>=', $thisMonth->toDateString())
            ->sum('total');

        $lastMonthRevenue = Sale::where('status', 'selesai')
            ->whereDate('date', '>=', $lastMonth->toDateString())
            ->whereDate('date', '<=', $lastMonthEnd->toDateString())
            ->sum('total');

        $revenueGrowth = $lastMonthRevenue > 0
            ? round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;

        // Sales count this month vs last month
        $thisMonthSales = Sale::where('status', 'selesai')
            ->whereDate('date', '>=', $thisMonth->toDateString())
            ->count();

        $lastMonthSales = Sale::where('status', 'selesai')
            ->whereDate('date', '>=', $lastMonth->toDateString())
            ->whereDate('date', '<=', $lastMonthEnd->toDateString())
            ->count();

        $salesGrowth = $lastMonthSales > 0
            ? round((($thisMonthSales - $lastMonthSales) / $lastMonthSales) * 100, 1)
            : 0;

        return $this->success([
            'total_revenue'        => (float) $thisMonthRevenue,
            'total_revenue_growth' => $revenueGrowth,
            'total_sales'          => $thisMonthSales,
            'total_sales_growth'   => $salesGrowth,
            'total_products'       => Product::count(),
            'available_products'   => Product::where('status', 'aktif')->count(),
            'low_stock_count'      => Product::whereColumn('stock', '<=', 'min_stock')->count(),
            'total_employees'      => Employee::where('status', 'aktif')->count(),
            'today_revenue'        => (float) Sale::where('status', 'selesai')->whereDate('date', $today)->sum('total'),
            'today_transactions'   => Sale::where('status', 'selesai')->whereDate('date', $today)->count(),
        ]);
    }

    /**
     * Monthly sales data for the last 12 months.
     * Returns: [ { month: 'Oct 2025', revenue: 12500000, transactions: 45 }, ... ]
     */
    public function monthlySales(): JsonResponse
    {
        $data = [];

        for ($i = 11; $i >= 0; $i--) {
            $date  = now()->subMonths($i);
            $start = $date->copy()->startOfMonth()->toDateString();
            $end   = $date->copy()->endOfMonth()->toDateString();

            $row = Sale::where('status', 'selesai')
                ->whereDate('date', '>=', $start)
                ->whereDate('date', '<=', $end)
                ->selectRaw('SUM(total) as revenue, COUNT(*) as transactions')
                ->first();

            $data[] = [
                'month'        => $date->format('M Y'),
                'year_month'   => $date->format('Y-m'),
                'revenue'      => (float) ($row->revenue ?? 0),
                'transactions' => (int) ($row->transactions ?? 0),
            ];
        }

        return $this->success($data);
    }

    /**
     * Weekly sales for the last 7 days.
     * Returns: [ { date: '2026-10-02', day: 'Thu', revenue: 500000, transactions: 3 }, ... ]
     */
    public function weeklySales(): JsonResponse
    {
        $data = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();

            $row = Sale::where('status', 'selesai')
                ->whereDate('date', $date)
                ->selectRaw('SUM(total) as revenue, COUNT(*) as transactions')
                ->first();

            $data[] = [
                'date'         => $date,
                'day'          => Carbon::parse($date)->format('D'),
                'revenue'      => (float) ($row->revenue ?? 0),
                'transactions' => (int) ($row->transactions ?? 0),
            ];
        }

        return $this->success($data);
    }

    /**
     * Category distribution for stock chart.
     * Returns: [ { category: 'Laptop', product_count: 15, total_stock: 47 }, ... ]
     */
    public function categoryDistribution(): JsonResponse
    {
        $data = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('products.status', 'aktif')
            ->selectRaw('categories.name as category, COUNT(products.id) as product_count, SUM(products.stock) as total_stock')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('product_count')
            ->get();

        return $this->success($data);
    }

    /**
     * Today's attendance summary.
     * Returns counts per status + total active employees.
     */
    public function attendanceSummary(): JsonResponse
    {
        $today         = now()->toDateString();
        $totalActive   = Employee::where('status', 'aktif')->count();

        $summary = Attendance::whereDate('date', $today)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return $this->success([
            'total_employees' => $totalActive,
            'hadir'           => (int) ($summary['hadir']     ?? 0),
            'terlambat'       => (int) ($summary['terlambat'] ?? 0),
            'izin'            => (int) ($summary['izin']      ?? 0),
            'sakit'           => (int) ($summary['sakit']     ?? 0),
            'alpha'           => (int) ($summary['alpha']     ?? 0),
            'belum_absen'     => $totalActive - $summary->sum(),
        ]);
    }

    /**
     * Products at or below minimum stock level.
     */
    public function lowStockProducts(): JsonResponse
    {
        $products = Product::with('category')
            ->whereColumn('stock', '<=', 'min_stock')
            ->where('status', 'aktif')
            ->orderBy('stock')
            ->limit(20)
            ->get();

        return $this->success($products);
    }

    /**
     * Latest 8 sales transactions.
     */
    public function recentTransactions(): JsonResponse
    {
        $sales = Sale::with('cashier')
            ->where('status', 'selesai')
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->limit(8)
            ->get();

        return $this->success($sales);
    }
}
