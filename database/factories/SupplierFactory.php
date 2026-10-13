<?php

namespace Database\Factories;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Supplier>
 */
class SupplierFactory extends Factory
{
    protected static int $sequence = 1;

    public function definition(): array
    {
        $num = static::$sequence++;
        return [
            'code'           => 'SUP-' . str_pad($num, 3, '0', STR_PAD_LEFT),
            'name'           => fake()->company(),
            'phone'          => fake()->phoneNumber(),
            'email'          => fake()->unique()->companyEmail(),
            'address'        => fake()->address(),
            'contact_person' => fake()->name(),
            'status'         => 'aktif',
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'nonaktif']);
    }
}
