<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * ===========================================================
     * PRO.COM Store Management System — Seeding Order
     * ===========================================================
     *
     * Execution order respects foreign key dependencies:
     *
     * 1. SettingSeeder    — store info + GPS geofence config
     * 2. EmployeeSeeder   — master employee records (EMP-001..EMP-008)
     * 3. UserSeeder       — 3 dev accounts linked to employees
     * 4. CategorySeeder   — 10 product categories
     * 5. SupplierSeeder   — 7 suppliers (SUP-001..SUP-007)
     * 6. ProductSeeder    — 21 products referencing categories + suppliers
     * 7. AttendanceDemoSeeder — demo attendance for past 7 working days
     *
     * ===========================================================
     * ⚠  DEVELOPMENT/TEST CREDENTIALS — CHANGE BEFORE PRODUCTION
     * ===========================================================
     *
     * admin@procom.test    / Admin@12345    / role: admin
     * cashier@procom.test  / Cashier@12345  / role: cashier
     * owner@procom.test    / Owner@12345    / role: owner
     *
     * ===========================================================
     * IDEMPOTENCY
     * ===========================================================
     *
     * All seeders use updateOrCreate — safe to run repeatedly
     * during development without destroying existing data.
     *
     * To reset the entire database:
     *   php artisan migrate:fresh --seed
     *
     * To seed without resetting:
     *   php artisan db:seed
     */
    public function run(): void
    {
        $this->call([
            SettingSeeder::class,       // 1. Settings (no FKs)
            EmployeeSeeder::class,      // 2. Employees (no FKs)
            UserSeeder::class,          // 3. Users → employees.id
            CategorySeeder::class,      // 4. Categories (no FKs)
            SupplierSeeder::class,      // 5. Suppliers (no FKs)
            ProductSeeder::class,       // 6. Products → categories.id + suppliers.id
            AttendanceDemoSeeder::class,// 7. Attendance demo → employees.id
        ]);
    }
}
