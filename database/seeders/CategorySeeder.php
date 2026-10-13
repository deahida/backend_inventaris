<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed realistic product categories for a laptop/computer store.
     * Idempotent: uses updateOrCreate keyed on name.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Laptop',        'description' => 'Laptop, notebook, ultrabook dari berbagai merek.'],
            ['name' => 'Monitor',        'description' => 'Monitor desktop LED, IPS, 4K, gaming, dan profesional.'],
            ['name' => 'Komponen PC',    'description' => 'Motherboard, prosesor, RAM, dan kartu grafis.'],
            ['name' => 'Storage',        'description' => 'SSD, HDD, flash drive, dan kartu memori.'],
            ['name' => 'Networking',     'description' => 'Router, switch, access point, dan perangkat jaringan.'],
            ['name' => 'Peripherals',    'description' => 'Keyboard, mouse, headset, webcam, dan periferal lainnya.'],
            ['name' => 'Aksesoris',      'description' => 'Tas laptop, kabel, hub USB, dan aksesoris pendukung.'],
            ['name' => 'Printer',        'description' => 'Printer inkjet, laser, dan multifungsi.'],
            ['name' => 'Power Supply',   'description' => 'UPS, power strip, adaptor, dan powerbank.'],
            ['name' => 'Software',       'description' => 'Lisensi software, antivirus, dan sistem operasi.'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['name' => $cat['name']], $cat);
        }

        $this->command->info('Categories seeded: ' . count($categories) . ' records.');
    }
}
