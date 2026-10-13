<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    protected static int $sequence = 1;

    public function definition(): array
    {
        $num = static::$sequence++;
        return [
            'employee_id' => 'EMP-' . str_pad($num, 3, '0', STR_PAD_LEFT),
            'name'        => fake()->name(),
            'email'       => fake()->unique()->safeEmail(),
            'phone'       => fake()->phoneNumber(),
            'position'    => fake()->randomElement(['Kasir', 'Admin', 'Gudang', 'IT Support', 'Sales']),
            'address'     => fake()->address(),
            'join_date'   => fake()->dateTimeBetween('-3 years', '-1 month')->format('Y-m-d'),
            'status'      => fake()->randomElement(['aktif', 'aktif', 'aktif', 'nonaktif']),
            'avatar'      => null,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'aktif']);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'nonaktif']);
    }
}
