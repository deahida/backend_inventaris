<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AttendanceDemoSeeder extends Seeder
{
    /**
     * Seed demo attendance records for the past 7 working days.
     *
     * Rules:
     *   - Unique constraint: (employee_id, date) — enforced via updateOrCreate
     *   - hadir/terlambat: real check-in/out times with GPS coordinates
     *   - izin/sakit/alpha: no GPS or selfie data
     *   - GPS near store (lat: -6.802766, lon: 110.843812) with small random offset
     *   - No face recognition — selfie photos stored as null (no real files in demo)
     *
     * This seeder is OPTIONAL — only adds useful data for testing dashboard/reports.
     * It is idempotent: safe to run multiple times.
     */
    public function run(): void
    {
        $employees = Employee::where('status', 'aktif')->get();

        if ($employees->isEmpty()) {
            $this->command->warn('No active employees found — skipping attendance demo seed.');
            return;
        }

        $created = 0;

        // Generate records for past 7 days (skip weekends)
        for ($daysBack = 7; $daysBack >= 1; $daysBack--) {
            $date = Carbon::now()->subDays($daysBack);

            // Skip Saturday and Sunday
            if ($date->isWeekend()) {
                continue;
            }

            $dateStr = $date->format('Y-m-d');

            foreach ($employees as $employee) {
                // Skip if already exists (idempotency)
                if (Attendance::where('employee_id', $employee->id)->whereDate('date', $dateStr)->exists()) {
                    continue;
                }

                // Weight: 70% hadir, 10% terlambat, 8% izin, 7% sakit, 5% alpha
                $rand = rand(1, 100);
                if ($rand <= 70) {
                    $status = 'hadir';
                } elseif ($rand <= 80) {
                    $status = 'terlambat';
                } elseif ($rand <= 88) {
                    $status = 'izin';
                } elseif ($rand <= 95) {
                    $status = 'sakit';
                } else {
                    $status = 'alpha';
                }

                $checkInAt  = null;
                $checkOutAt = null;
                $lat        = null;
                $lon        = null;
                $dist       = null;
                $latOut     = null;
                $lonOut     = null;
                $distOut    = null;
                $note       = null;

                if ($status === 'hadir') {
                    // Before 08:00
                    $hour       = 7;
                    $minute     = rand(0, 59);
                    $checkInAt  = Carbon::parse($dateStr)->setTime($hour, $minute, 0);
                    $checkOutAt = $checkInAt->copy()->addHours(rand(7, 9))->addMinutes(rand(0, 59));
                    $lat  = -6.802766 + (rand(-100, 100) / 100000);
                    $lon  = 110.843812 + (rand(-100, 100) / 100000);
                    $dist = rand(10, 150);
                    $latOut  = $lat + (rand(-10, 10) / 100000);
                    $lonOut  = $lon + (rand(-10, 10) / 100000);
                    $distOut = rand(10, 150);
                } elseif ($status === 'terlambat') {
                    // 08:00 or later
                    $hour       = rand(8, 10);
                    $minute     = rand(0, 59);
                    $checkInAt  = Carbon::parse($dateStr)->setTime($hour, $minute, 0);
                    $checkOutAt = $checkInAt->copy()->addHours(rand(6, 8))->addMinutes(rand(0, 59));
                    $lat  = -6.802766 + (rand(-100, 100) / 100000);
                    $lon  = 110.843812 + (rand(-100, 100) / 100000);
                    $dist = rand(10, 150);
                    $latOut  = $lat + (rand(-10, 10) / 100000);
                    $lonOut  = $lon + (rand(-10, 10) / 100000);
                    $distOut = rand(10, 150);
                } elseif ($status === 'izin') {
                    $note = 'Ijin keperluan keluarga';
                } elseif ($status === 'sakit') {
                    $note = 'Surat keterangan sakit terlampir';
                }

                Attendance::updateOrCreate(
                    ['employee_id' => $employee->id, 'date' => $dateStr],
                    [
                        'status'              => $status,
                        'check_in_at'         => $checkInAt,
                        'check_out_at'        => $checkOutAt,
                        'check_in_photo'      => null,  // no demo photo files
                        'check_out_photo'     => null,
                        'check_in_latitude'   => $lat,
                        'check_in_longitude'  => $lon,
                        'check_in_distance'   => $dist,
                        'check_out_latitude'  => $latOut,
                        'check_out_longitude' => $lonOut,
                        'check_out_distance'  => $distOut,
                        'note'                => $note,
                    ]
                );

                $created++;
            }
        }

        $this->command->info("Attendance demo records seeded: {$created} records (7 working days).");
    }
}
