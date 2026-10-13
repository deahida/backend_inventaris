<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Seed realistic supplier records for a laptop/computer store.
     * Idempotent: uses updateOrCreate keyed on code.
     */
    public function run(): void
    {
        $suppliers = [
            [
                'code'           => 'SUP-001',
                'name'           => 'PT. Acer Indonesia',
                'phone'          => '021-5765000',
                'email'          => 'sales@acer.co.id',
                'address'        => 'Menara Jamsostek, Jl. Gatot Subroto No. 38, Jakarta Selatan',
                'contact_person' => 'Bima Ardianto',
                'status'         => 'aktif',
            ],
            [
                'code'           => 'SUP-002',
                'name'           => 'PT. ASUS Indonesia',
                'phone'          => '021-29577888',
                'email'          => 'info@asus.co.id',
                'address'        => 'Wisma Mulia, Jl. Jend. Gatot Subroto No. 42, Jakarta',
                'contact_person' => 'Rina Kusuma',
                'status'         => 'aktif',
            ],
            [
                'code'           => 'SUP-003',
                'name'           => 'PT. Lenovo Indonesia',
                'phone'          => '021-29034888',
                'email'          => 'support@lenovo.co.id',
                'address'        => 'Sequis Tower, Jl. Jend. Sudirman No. 71, Jakarta',
                'contact_person' => 'Dodi Permana',
                'status'         => 'aktif',
            ],
            [
                'code'           => 'SUP-004',
                'name'           => 'PT. Samsung Electronics Indonesia',
                'phone'          => '021-29291234',
                'email'          => 'b2b@samsung.co.id',
                'address'        => 'Samsung House, Jl. Dharmawangsa Raya No. 4, Jakarta',
                'contact_person' => 'Sari Dewi',
                'status'         => 'aktif',
            ],
            [
                'code'           => 'SUP-005',
                'name'           => 'CV. Distribusi Komputer Semarang',
                'phone'          => '024-8411234',
                'email'          => 'order@diskomp-smg.co.id',
                'address'        => 'Ruko Komputer Plaza, Jl. Pandanaran No. 12, Semarang',
                'contact_person' => 'Agus Prasetyo',
                'status'         => 'aktif',
            ],
            [
                'code'           => 'SUP-006',
                'name'           => 'UD. Mitra Teknologi Kudus',
                'phone'          => '0291-445678',
                'email'          => 'mitra.tek@gmail.com',
                'address'        => 'Jl. Jend. Sudirman No. 88, Kudus',
                'contact_person' => 'Hadi Nugroho',
                'status'         => 'aktif',
            ],
            [
                'code'           => 'SUP-007',
                'name'           => 'PT. Logitech Indonesia',
                'phone'          => '021-29031234',
                'email'          => 'sales.id@logitech.com',
                'address'        => 'Pacific Place, Jl. Jend. Sudirman No. 52-53, Jakarta',
                'contact_person' => 'Maya Sari',
                'status'         => 'nonaktif',
            ],
        ];

        foreach ($suppliers as $sup) {
            Supplier::updateOrCreate(['code' => $sup['code']], $sup);
        }

        $this->command->info('Suppliers seeded: ' . count($suppliers) . ' records.');
    }
}
