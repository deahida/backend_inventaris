<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Attendance>
 */
class AttendanceFactory extends Factory
{
    public function definition(): array
    {
        $status   = fake()->randomElement(['hadir', 'hadir', 'hadir', 'terlambat', 'izin', 'sakit', 'alpha']);
        $date     = fake()->dateTimeBetween('-30 days', 'yesterday')->format('Y-m-d');
        $checkIn  = null;
        $checkOut = null;

        if (in_array($status, ['hadir', 'terlambat'])) {
            $hour      = $status === 'hadir' ? fake()->numberBetween(7, 7) : fake()->numberBetween(8, 10);
            $minute    = fake()->numberBetween(0, 59);
            $checkIn   = Carbon::parse($date)->setTime($hour, $minute, 0);
            // checkout 6-10 hours later
            $checkOut  = $checkIn->copy()->addHours(fake()->numberBetween(6, 10))->addMinutes(fake()->numberBetween(0, 59));
        }

        return [
            'employee_id'         => Employee::inRandomOrder()->value('id') ?? Employee::factory(),
            'date'                => $date,
            'status'              => $status,
            'check_in_at'         => $checkIn,
            'check_out_at'        => $checkOut,
            'check_in_photo'      => null,
            'check_out_photo'     => null,
            'check_in_latitude'   => $checkIn ? -6.802766 + fake()->randomFloat(6, -0.001, 0.001) : null,
            'check_in_longitude'  => $checkIn ? 110.843812 + fake()->randomFloat(6, -0.001, 0.001) : null,
            'check_in_distance'   => $checkIn ? fake()->numberBetween(10, 180) : null,
            'check_out_latitude'  => $checkOut ? -6.802766 + fake()->randomFloat(6, -0.001, 0.001) : null,
            'check_out_longitude' => $checkOut ? 110.843812 + fake()->randomFloat(6, -0.001, 0.001) : null,
            'check_out_distance'  => $checkOut ? fake()->numberBetween(10, 180) : null,
            'note'                => $status === 'izin' ? 'Ijin keperluan keluarga' : ($status === 'sakit' ? 'Surat sakit terlampir' : null),
        ];
    }

    public function hadir(): static
    {
        return $this->state(function (array $attributes) {
            $date    = $attributes['date'] ?? now()->format('Y-m-d');
            $checkIn = Carbon::parse($date)->setTime(7, fake()->numberBetween(0, 59), 0);
            return [
                'status'       => 'hadir',
                'check_in_at'  => $checkIn,
                'check_out_at' => $checkIn->copy()->addHours(8),
            ];
        });
    }

    public function forDate(string $date): static
    {
        return $this->state(fn (array $attributes) => ['date' => $date]);
    }
}
