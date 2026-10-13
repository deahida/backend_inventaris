<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    use ApiResponse;

    /**
     * Sales report.
     *
     * Query params: date_from, date_to
     *
     * Returns:
     *   - summary: { total_transactions, total_revenue, avg_transaction }
     *   - daily_trend: [ { date, revenue, transactions }, ... ]
     *   - top_products: top 5 by quantity sold
     */
    public function sales(Request $request): JsonResponse
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth()->toDateString());
        $dateTo   = $request->get('date_to',   now()->toDateString());

        $baseQuery = Sale::where('status', 'selesai')
            ->whereDate('date', '>=', $dateFrom)
            ->whereDate('date', '<=', $dateTo);

        // Summary
        $summary = $baseQuery->clone()
            ->selectRaw('COUNT(*) as total_transactions, SUM(total) as total_revenue, AVG(total) as avg_transaction')
            ->first();

        // Daily trend
        $dailyTrend = $baseQuery->clone()
            ->selectRaw('DATE(date) as date, SUM(total) as revenue, COUNT(*) as transactions')
            ->groupBy(DB::raw('DATE(date)'))
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => [
                'date'         => $r->date,
                'revenue'      => (float) $r->revenue,
                'transactions' => (int) $r->transactions,
            ]);

        // Top 5 products by quantity sold in this period
        $saleIds = $baseQuery->clone()->pluck('id');

        $topProducts = SaleItem::whereIn('sale_id', $saleIds)
            ->selectRaw('product_name, product_code, SUM(quantity) as total_qty, SUM(subtotal) as total_revenue')
            ->groupBy('product_code', 'product_name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get()
            ->map(fn ($r) => [
                'product_code'  => $r->product_code,
                'product_name'  => $r->product_name,
                'total_qty'     => (int) $r->total_qty,
                'total_revenue' => (float) $r->total_revenue,
            ]);

        return $this->success([
            'period'        => ['from' => $dateFrom, 'to' => $dateTo],
            'summary'       => [
                'total_transactions' => (int) ($summary->total_transactions ?? 0),
                'total_revenue'      => (float) ($summary->total_revenue ?? 0),
                'avg_transaction'    => round((float) ($summary->avg_transaction ?? 0), 2),
            ],
            'daily_trend'   => $dailyTrend,
            'top_products'  => $topProducts,
        ]);
    }

    /**
     * Inventory report.
     *
     * Returns:
     *   - summary: total products, active/inactive counts, low stock count
     *   - category_breakdown: products and stock per category
     *   - low_stock: products at or below min_stock
     */
    public function inventory(Request $request): JsonResponse
    {
        $summary = [
            'total'      => Product::count(),
            'active'     => Product::where('status', 'aktif')->count(),
            'inactive'   => Product::where('status', 'nonaktif')->count(),
            'low_stock'  => Product::whereColumn('stock', '<=', 'min_stock')->count(),
            'out_of_stock' => Product::where('stock', 0)->count(),
        ];

        $categoryBreakdown = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->selectRaw('categories.name as category, COUNT(products.id) as product_count, SUM(products.stock) as total_stock, SUM(products.stock * products.selling_price) as stock_value')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('product_count')
            ->get();

        $lowStock = Product::with('category')
            ->whereColumn('stock', '<=', 'min_stock')
            ->where('status', 'aktif')
            ->orderBy('stock')
            ->get();

        return $this->success([
            'summary'             => $summary,
            'category_breakdown'  => $categoryBreakdown,
            'low_stock_products'  => $lowStock,
        ]);
    }

    /**
     * Attendance report — monthly per-employee summary.
     *
     * Query params: month (YYYY-MM), employee_id (optional)
     */
    public function attendance(Request $request): JsonResponse
    {
        $month = $request->get('month', now()->format('Y-m'));

        try {
            $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth()->toDateString();
            $end   = Carbon::createFromFormat('Y-m', $month)->endOfMonth()->toDateString();
        } catch (\Exception) {
            return $this->error('Invalid month format. Use YYYY-MM.', 400);
        }

        $query = Employee::with([
            'attendances' => fn ($q) => $q->whereBetween('date', [$start, $end]),
        ])->where('status', 'aktif');

        if ($request->filled('employee_id')) {
            $query->where('id', $request->employee_id);
        }

        $employees = $query->orderBy('name')->get();

        $report = $employees->map(function (Employee $emp) {
            $counts = $emp->attendances->countBy('status');
            return [
                'employee_id'   => $emp->id,
                'employee_code' => $emp->employee_id,
                'name'          => $emp->name,
                'position'      => $emp->position,
                'hadir'         => (int) ($counts['hadir']     ?? 0),
                'terlambat'     => (int) ($counts['terlambat'] ?? 0),
                'izin'          => (int) ($counts['izin']      ?? 0),
                'sakit'         => (int) ($counts['sakit']     ?? 0),
                'alpha'         => (int) ($counts['alpha']     ?? 0),
                'total'         => $emp->attendances->count(),
            ];
        });

        return $this->success([
            'month'    => $month,
            'period'   => ['from' => $start, 'to' => $end],
            'report'   => $report,
        ]);
    }
}
