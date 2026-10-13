<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\StockInController;
use App\Http\Controllers\StockOutController;
use App\Http\Controllers\StockTransactionController;
use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| PRO.COM Store Management System — API Routes
|--------------------------------------------------------------------------
|
| Base URL: /api  (applied by Laravel automatically from routes/api.php)
|
| Authentication:  Laravel Sanctum (Bearer token — stored as procom_token)
| Authorization:   EnsureRole middleware aliased as 'role'
|
| Authorization Matrix:
|   admin   → full access
|   cashier → dashboard, own attendance, sales (read/create)
|   owner   → dashboard, products (read), employees (read),
|              sales (read), reports, attendance reports
|
*/

// =============================================================================
// PUBLIC ROUTES — No authentication required
// =============================================================================

Route::prefix('auth')->name('auth.')->middleware('throttle:auth')->group(function () {
    Route::post('login',          [AuthController::class, 'login'])->name('login');
    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot-password');
    Route::post('reset-password', [AuthController::class, 'resetPassword'])->name('reset-password');
});

// =============================================================================
// AUTHENTICATED ROUTES — Require Sanctum token
// =============================================================================

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // -------------------------------------------------------------------------
    // AUTH — Profile & session management (all authenticated roles)
    // -------------------------------------------------------------------------

    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('logout',   [AuthController::class, 'logout'])->name('logout');
        Route::get('me',        [AuthController::class, 'me'])->name('me');
        Route::put('profile',   [AuthController::class, 'updateProfile'])->name('profile');
        Route::put('password',  [AuthController::class, 'changePassword'])->name('password');
    });

    // -------------------------------------------------------------------------
    // DASHBOARD — admin, cashier, owner
    // -------------------------------------------------------------------------

    Route::prefix('dashboard')->name('dashboard.')->middleware('role:admin,cashier,owner')->group(function () {
        Route::get('stats',                 [DashboardController::class, 'stats'])->name('stats');
        Route::get('monthly-sales',         [DashboardController::class, 'monthlySales'])->name('monthly-sales');
        Route::get('weekly-sales',          [DashboardController::class, 'weeklySales'])->name('weekly-sales');
        Route::get('category-distribution', [DashboardController::class, 'categoryDistribution'])->name('category-distribution');
        Route::get('attendance-summary',    [DashboardController::class, 'attendanceSummary'])->name('attendance-summary');
        Route::get('low-stock-products',    [DashboardController::class, 'lowStockProducts'])->name('low-stock-products');
        Route::get('recent-transactions',   [DashboardController::class, 'recentTransactions'])->name('recent-transactions');
    });


    // -------------------------------------------------------------------------
    // PRODUCTS — Read: admin, owner, cashier | Write: admin
    // -------------------------------------------------------------------------

    Route::prefix('products')->name('products.')->group(function () {
        // Read products: admin, owner, cashier
        Route::get('/', [ProductController::class, 'index'])
            ->name('index')
            ->middleware('role:admin,owner,cashier');

        Route::get('{product}', [ProductController::class, 'show'])
            ->name('show')
            ->middleware('role:admin,owner,cashier');

        // Write products: admin only
        Route::post('/', [ProductController::class, 'store'])
            ->name('store')
            ->middleware('role:admin');

        Route::put('{product}', [ProductController::class, 'update'])
            ->name('update')
            ->middleware('role:admin');

        Route::delete('{product}', [ProductController::class, 'destroy'])
            ->name('destroy')
            ->middleware('role:admin');
    });

    // -------------------------------------------------------------------------
    // CATEGORIES — admin only
    // -------------------------------------------------------------------------

    Route::prefix('categories')->name('categories.')->middleware('role:admin')->group(function () {
        Route::get('/',             [CategoryController::class, 'index'])->name('index');
        Route::post('/',            [CategoryController::class, 'store'])->name('store');
        Route::get('{category}',    [CategoryController::class, 'show'])->name('show');
        Route::put('{category}',    [CategoryController::class, 'update'])->name('update');
        Route::delete('{category}', [CategoryController::class, 'destroy'])->name('destroy');
    });

    // -------------------------------------------------------------------------
    // SUPPLIERS — admin only
    // -------------------------------------------------------------------------

    Route::prefix('suppliers')->name('suppliers.')->middleware('role:admin')->group(function () {
        Route::get('/',             [SupplierController::class, 'index'])->name('index');
        Route::post('/',            [SupplierController::class, 'store'])->name('store');
        Route::get('{supplier}',    [SupplierController::class, 'show'])->name('show');
        Route::put('{supplier}',    [SupplierController::class, 'update'])->name('update');
        Route::delete('{supplier}', [SupplierController::class, 'destroy'])->name('destroy');
    });

    // -------------------------------------------------------------------------
    // STOCK IN — admin only
    // -------------------------------------------------------------------------

    Route::prefix('stock-in')->name('stock-in.')->middleware('role:admin')->group(function () {
        Route::get('/',          [StockInController::class, 'index'])->name('index');
        Route::post('/',         [StockInController::class, 'store'])->name('store');
        Route::get('{stockIn}',  [StockInController::class, 'show'])->name('show');
    });

    // -------------------------------------------------------------------------
    // STOCK OUT — admin only
    // -------------------------------------------------------------------------

    Route::post('stock-out', [StockOutController::class, 'store'])
        ->name('stock-out.store')
        ->middleware('role:admin');

    // -------------------------------------------------------------------------
    // STOCK TRANSACTIONS — Read-only, admin only
    // -------------------------------------------------------------------------

    Route::prefix('stock-transactions')->name('stock-transactions.')->middleware('role:admin')->group(function () {
        Route::get('/',                       [StockTransactionController::class, 'index'])->name('index');
        Route::get('{stockTransaction}',      [StockTransactionController::class, 'show'])->name('show');
    });

    // -------------------------------------------------------------------------
    // SALES — Read: admin, cashier, owner | Create: admin, cashier | Cancel: admin
    // -------------------------------------------------------------------------

    Route::prefix('sales')->name('sales.')->group(function () {
        // Read: all three roles
        Route::get('/',        [SaleController::class, 'index'])->name('index')->middleware('role:admin,cashier,owner');
        Route::get('{sale}',   [SaleController::class, 'show'])->name('show')->middleware('role:admin,cashier,owner');

        // Create: admin + cashier (owner cannot create sales)
        Route::post('/',       [SaleController::class, 'store'])->name('store')->middleware('role:admin,cashier');

        // Cancel: admin only (dedicated endpoint — no arbitrary status changes)
        Route::patch('{sale}/cancel', [SaleController::class, 'cancel'])->name('cancel')->middleware('role:admin');
    });

    // -------------------------------------------------------------------------
    // EMPLOYEES — Read: admin, owner | Write: admin
    // -------------------------------------------------------------------------

    Route::prefix('employees')->name('employees.')->group(function () {
        // Read
        Route::get('/',             [EmployeeController::class, 'index'])->name('index')->middleware('role:admin,owner');
        Route::get('{employee}',    [EmployeeController::class, 'show'])->name('show')->middleware('role:admin,owner');

        // Write (admin only — includes deactivation via DELETE)
        Route::post('/',            [EmployeeController::class, 'store'])->name('store')->middleware('role:admin');
        Route::put('{employee}',    [EmployeeController::class, 'update'])->name('update')->middleware('role:admin');
        Route::delete('{employee}', [EmployeeController::class, 'destroy'])->name('destroy')->middleware('role:admin');
    });

    // -------------------------------------------------------------------------
    // ATTENDANCE
    //   /attendance/today        — admin only
    //   /attendance/my           — admin, cashier
    //   /attendance/my/history   — admin, cashier
    //   /attendance/check-in     — admin, cashier
    //   /attendance/check-out    — admin, cashier
    //   /attendance              — admin only (all records)
    //   /attendance/manual       — admin only
    //   /attendance/report       — admin, owner
    //
    // NOTE: Specific named routes are declared before the wildcard
    //       {employee} patterns to avoid routing conflicts.
    //
    // NO routes related to facial recognition, face matching,
    // face embeddings, or biometric identification exist anywhere.
    // -------------------------------------------------------------------------

    Route::prefix('attendance')->name('attendance.')->group(function () {
        // Admin-only overview
        Route::get('today',         [AttendanceController::class, 'today'])->name('today')->middleware('role:admin');

        // Own attendance (admin + cashier)
        Route::get('my',            [AttendanceController::class, 'myAttendance'])->name('my')->middleware('role:admin,cashier');
        Route::get('my/history',    [AttendanceController::class, 'myHistory'])->name('my.history')->middleware('role:admin,cashier');

        // Check-in / check-out (admin + cashier, multipart/form-data)
        Route::post('check-in',     [AttendanceController::class, 'checkIn'])->name('check-in')->middleware('role:admin,cashier');
        Route::post('check-out',    [AttendanceController::class, 'checkOut'])->name('check-out')->middleware('role:admin,cashier');

        // Admin: all records
        Route::get('/',             [AttendanceController::class, 'index'])->name('index')->middleware('role:admin');

        // Admin: manual attendance entry (izin / sakit / alpha)
        Route::post('manual',       [AttendanceController::class, 'manual'])->name('manual')->middleware('role:admin');

        // Report (admin + owner)
        Route::get('report',        [AttendanceController::class, 'report'])->name('report')->middleware('role:admin,owner');
    });

    // -------------------------------------------------------------------------
    // REPORTS — admin, owner
    // -------------------------------------------------------------------------

    Route::prefix('reports')->name('reports.')->middleware('role:admin,owner')->group(function () {
        Route::get('sales',      [ReportController::class, 'sales'])->name('sales');
        Route::get('inventory',  [ReportController::class, 'inventory'])->name('inventory');
        Route::get('attendance', [ReportController::class, 'attendance'])->name('attendance');
    });

    // -------------------------------------------------------------------------
    // SETTINGS — admin only
    // -------------------------------------------------------------------------

    Route::prefix('settings')->name('settings.')->middleware('role:admin')->group(function () {
        Route::get('/',  [SettingController::class, 'index'])->name('index');
        Route::put('/',  [SettingController::class, 'update'])->name('update');
    });

});
