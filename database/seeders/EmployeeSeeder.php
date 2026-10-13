<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployeeSeeder extends Seeder
{
    /**
     * Seed employee records including the three linked to development user accounts.
     *
     * Idempotent: uses updateOrCreate keyed on employee_id.
     *
     * Development employees (linked to user accounts):
     *   EMP-001 → admin@procom.test (Admin)
     *   EMP-002 → cashier@procom.test (Kasir)
     *   EMP-003 → owner@procom.test (Owner/Manager)
     *
     * Additional standalone employees (no user account):
     *   EMP-004 through EMP-008
     */
    public function run(): void
    {
        $employees = [
            // --- Core staff with user accounts ---
            [
                'employee_id' => 'EMP-001',
                'name'        => 'Ahmad Fauzi',
                'email'       => 'admin@procom.test',
                'phone'       => '081234567890',
                'position'    => 'Administrator',
                'address'     => 'Jl. Pemuda No. 12, Kudus',
                'join_date'   => '2022-01-10',
                'status'      => 'aktif',
            ],
            [
                'employee_id' => 'EMP-002',
                'name'        => 'Siti Nurhaliza',
                'email'       => 'cashier@procom.test',
                'phone'       => '082345678901',
                'position'    => 'Kasir',
                'address'     => 'Jl. Sunan Kudus No. 8, Kudus',
                'join_date'   => '2022-03-15',
                'status'      => 'aktif',
            ],
            [
                'employee_id' => 'EMP-003',
                'name'        => 'Budi Santoso',
                'email'       => 'owner@procom.test',
                'phone'       => '083456789012',
                'position'    => 'Pemilik',
                'address'     => 'Jl. Veteran No. 45, Kudus',
                'join_date'   => '2021-06-01',
                'status'      => 'aktif',
            ],
            // --- Additional staff (no user accounts) ---
            [
                'employee_id' => 'EMP-004',
                'name'        => 'Rizky Prasetyo',
                'email'       => 'rizky@procom.test',
                'phone'       => '084567890123',
                'position'    => 'Teknisi',
                'address'     => 'Jl. Muria No. 3, Kudus',
                'join_date'   => '2023-01-20',
                'status'      => 'aktif',
            ],
            [
                'employee_id' => 'EMP-005',
                'name'        => 'Dewi Anggraini',
                'email'       => 'dewi@procom.test',
                'phone'       => '085678901234',
                'position'    => 'Kasir',
                'address'     => 'Jl. Diponegoro No. 17, Kudus',
                'join_date'   => '2023-04-05',
                'status'      => 'aktif',
            ],
            [
                'employee_id' => 'EMP-006',
                'name'        => 'Hendra Wijaya',
                'email'       => 'hendra@procom.test',
                'phone'       => '086789012345',
                'position'    => 'Gudang',
                'address'     => 'Jl. Raya Kudus No. 22, Kudus',
                'join_date'   => '2022-09-10',
                'status'      => 'aktif',
            ],
            [
                'employee_id' => 'EMP-007',
                'name'        => 'Ayu Lestari',
                'email'       => 'ayu@procom.test',
                'phone'       => '087890123456',
                'position'    => 'Sales',
                'address'     => 'Jl. Perum Graha Indah No. 7, Kudus',
                'join_date'   => '2023-07-12',
                'status'      => 'aktif',
            ],
            [
                'employee_id' => 'EMP-008',
                'name'        => 'Farid Hidayat',
                'email'       => 'farid@procom.test',
                'phone'       => '088901234567',
                'position'    => 'IT Support',
                'address'     => 'Jl. Lenteng Agung No. 5, Kudus',
                'join_date'   => '2021-11-30',
                'status'      => 'nonaktif',
            ],
        ];

        foreach ($employees as $data) {
            Employee::updateOrCreate(
                ['employee_id' => $data['employee_id']],
                $data
            );
        }

        $this->command->info('Employees seeded: ' . count($employees) . ' records.');
    }
}
