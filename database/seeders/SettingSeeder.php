<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Seed the initial PRO.COM store settings.
     *
     * Uses updateOrCreate for idempotency — safe to run multiple times.
     *
     * GPS coordinates match the hardcoded store location used by AttendanceController.
     * DO NOT change these coordinates — they must match the controller constants.
     */
    public function run(): void
    {
        $settings = [
            // Store information
            'store_name'    => 'PRO.COM Store',
            'store_address' => 'Jl. Ahmad Dahlan No. 10, Kudus, Jawa Tengah 59317',
            'store_phone'   => '0291-123456',
            'store_email'   => 'info@procom.store',

            // Geofence configuration — must match AttendanceController constants
            'geofence_latitude'  => '-6.802766454110481',
            'geofence_longitude' => '110.84381260861629',
            'geofence_radius'    => '200',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        $this->command->info('Settings seeded: ' . count($settings) . ' records.');
    }
}
