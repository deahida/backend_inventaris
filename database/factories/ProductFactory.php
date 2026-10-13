<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected static int $sequence = 1;

    private static array $productNames = [
        'Laptop ASUS VivoBook 15',
        'Laptop Lenovo ThinkPad X1',
        'Laptop HP Pavilion 14',
        'Laptop Dell Inspiron 15',
        'Laptop Acer Aspire 5',
        'Monitor LG 24 inch',
        'Monitor Samsung 27 inch',
        'Keyboard Mechanical Logitech',
        'Mouse Wireless Logitech',
        'SSD Samsung 500GB',
        'HDD Seagate 1TB',
        'RAM DDR4 8GB Kingston',
        'RAM DDR4 16GB Corsair',
        'Headset Gaming HyperX',
        'Webcam Logitech C920',
        'Router TP-Link Archer',
        'Switch Ethernet 8 Port',
        'Powerbank Xiaomi 20000mAh',
        'Laptop Bag Thinkpad 15',
        'USB Hub 7 Port',
    ];

    public function definition(): array
    {
        $num         = static::$sequence++;
        $purchase    = fake()->numberBetween(500000, 15000000);
        $selling     = (int) ($purchase * fake()->randomFloat(2, 1.1, 1.35));
        $stock       = fake()->numberBetween(0, 50);
        $minStock    = fake()->numberBetween(2, 10);
        $nameIndex   = ($num - 1) % count(self::$productNames);
        $suffix      = $num > count(self::$productNames) ? ' v' . ceil($num / count(self::$productNames)) : '';

        return [
            'code'           => 'PRD-' . str_pad($num, 5, '0', STR_PAD_LEFT),
            'name'           => self::$productNames[$nameIndex] . $suffix,
            'category_id'    => Category::inRandomOrder()->value('id') ?? Category::factory(),
            'supplier_id'    => Supplier::inRandomOrder()->value('id') ?? Supplier::factory(),
            'purchase_price' => $purchase,
            'selling_price'  => $selling,
            'stock'          => $stock,
            'min_stock'      => $minStock,
            'condition'      => fake()->randomElement(['baru', 'baru', 'baru', 'bekas', 'refurbished']),
            'status'         => fake()->randomElement(['aktif', 'aktif', 'aktif', 'nonaktif']),
            'description'    => fake()->optional()->paragraph(),
            'image'          => null,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'aktif']);
    }

    public function lowStock(): static
    {
        return $this->state(function (array $attributes) {
            $minStock = fake()->numberBetween(5, 15);
            return [
                'stock'     => fake()->numberBetween(0, $minStock),
                'min_stock' => $minStock,
            ];
        });
    }

    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => ['stock' => 0]);
    }

    public function baru(): static
    {
        return $this->state(fn (array $attributes) => ['condition' => 'baru']);
    }
}
