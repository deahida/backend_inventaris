<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed three development user accounts — one per role.
     *
     * ⚠️  DEVELOPMENT/TEST CREDENTIALS ONLY ⚠️
     *     These passwords MUST be changed before any production use.
     *
     * Accounts:
     *   admin@procom.test    / Admin@12345    / role: admin
     *   cashier@procom.test  / Cashier@12345  / role: cashier
     *   owner@procom.test    / Owner@12345    / role: owner
     *
     * Each user is linked to its corresponding employee record.
     * Idempotent: uses updateOrCreate keyed on email.
     */
    public function run(): void
    {
        $accounts = [
            [
                'name'        => 'Ahmad Fauzi',
                'email'       => 'admin@procom.test',
                'password'    => Hash::make('Admin@12345'),
                'phone'       => '081234567890',
                'position'    => 'Administrator',
                'role'        => 'admin',
                'employee_id_code' => 'EMP-001',
            ],
            [
                'name'        => 'Siti Nurhaliza',
                'email'       => 'cashier@procom.test',
                'password'    => Hash::make('Cashier@12345'),
                'phone'       => '082345678901',
                'position'    => 'Kasir',
                'role'        => 'cashier',
                'employee_id_code' => 'EMP-002',
            ],
            [
                'name'        => 'Budi Santoso',
                'email'       => 'owner@procom.test',
                'password'    => Hash::make('Owner@12345'),
                'phone'       => '083456789012',
                'position'    => 'Pemilik',
                'role'        => 'owner',
                'employee_id_code' => 'EMP-003',
            ],
        ];

        foreach ($accounts as $account) {
            // Resolve the employee FK
            $employeeCode = $account['employee_id_code'];
            $employee = Employee::where('employee_id', $employeeCode)->first();

            $userData = [
                'name'              => $account['name'],
                'password'          => $account['password'],
                'phone'             => $account['phone'],
                'position'          => $account['position'],
                'role'              => $account['role'],
                'employee_id'       => $employee?->id,
                'email_verified_at' => now(),
            ];

            User::updateOrCreate(
                ['email' => $account['email']],
                $userData
            );
        }

        $this->command->info('Users seeded: ' . count($accounts) . ' development accounts.');
        $this->command->warn('⚠  Change development passwords before any production deployment!');
    }
}
