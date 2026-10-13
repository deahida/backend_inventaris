<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Seed realistic products for a laptop/computer store.
     *
     * Idempotent: uses updateOrCreate keyed on code.
     *
     * Covers:
     *   - Multiple categories and suppliers
     *   - Normal stock, low stock, zero stock
     *   - New (baru), second-hand (bekas), refurbished
     *   - Active and inactive products
     *   - No product images (null) — avoids broken file references
     */
    public function run(): void
    {
        // Resolve category and supplier IDs by name/code for FK safety
        $cats = Category::pluck('id', 'name');
        $sups = Supplier::pluck('id', 'code');

        $products = [
            // ---- LAPTOPS ----
            [
                'code' => 'PRD-00001', 'name' => 'Laptop ASUS VivoBook 15 S1504',
                'category_id' => $cats['Laptop'] ?? 1, 'supplier_id' => $sups['SUP-002'] ?? 1,
                'purchase_price' => 7500000, 'selling_price' => 8750000,
                'stock' => 12, 'min_stock' => 3, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'Intel Core i5-1235U, RAM 8GB DDR4, SSD 512GB, layar 15.6" FHD.',
            ],
            [
                'code' => 'PRD-00002', 'name' => 'Laptop Lenovo ThinkPad X1 Carbon Gen 11',
                'category_id' => $cats['Laptop'] ?? 1, 'supplier_id' => $sups['SUP-003'] ?? 1,
                'purchase_price' => 18000000, 'selling_price' => 21500000,
                'stock' => 4, 'min_stock' => 2, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'Intel Core i7-1365U, RAM 16GB, SSD 1TB, layar 14" WUXGA IPS.',
            ],
            [
                'code' => 'PRD-00003', 'name' => 'Laptop Acer Aspire 5 A514',
                'category_id' => $cats['Laptop'] ?? 1, 'supplier_id' => $sups['SUP-001'] ?? 1,
                'purchase_price' => 5800000, 'selling_price' => 6800000,
                'stock' => 8, 'min_stock' => 3, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'AMD Ryzen 5 7520U, RAM 8GB, SSD 512GB, layar 14" FHD IPS.',
            ],
            [
                'code' => 'PRD-00004', 'name' => 'Laptop HP Pavilion 14-dv2',
                'category_id' => $cats['Laptop'] ?? 1, 'supplier_id' => $sups['SUP-005'] ?? 1,
                'purchase_price' => 6200000, 'selling_price' => 7200000,
                'stock' => 2, 'min_stock' => 3, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'Intel Core i5-1235U, RAM 8GB, SSD 512GB, layar 14" FHD IPS. Stok terbatas!',
            ],
            [
                'code' => 'PRD-00005', 'name' => 'Laptop ASUS Gaming ROG Strix G15',
                'category_id' => $cats['Laptop'] ?? 1, 'supplier_id' => $sups['SUP-002'] ?? 1,
                'purchase_price' => 19000000, 'selling_price' => 22000000,
                'stock' => 3, 'min_stock' => 2, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'AMD Ryzen 7, RAM 16GB, SSD 1TB, GPU RTX 3060, layar 15.6" 144Hz.',
            ],
            [
                'code' => 'PRD-00006', 'name' => 'Laptop Lenovo IdeaPad 3 Bekas',
                'category_id' => $cats['Laptop'] ?? 1, 'supplier_id' => $sups['SUP-006'] ?? 1,
                'purchase_price' => 3000000, 'selling_price' => 3800000,
                'stock' => 5, 'min_stock' => 2, 'condition' => 'bekas', 'status' => 'aktif',
                'description' => 'AMD Ryzen 5 5500U, RAM 8GB, SSD 256GB. Kondisi baik, layar normal.',
            ],
            [
                'code' => 'PRD-00007', 'name' => 'Laptop HP EliteBook Refurbished',
                'category_id' => $cats['Laptop'] ?? 1, 'supplier_id' => $sups['SUP-006'] ?? 1,
                'purchase_price' => 4000000, 'selling_price' => 5000000,
                'stock' => 0, 'min_stock' => 2, 'condition' => 'refurbished', 'status' => 'aktif',
                'description' => 'HP EliteBook 840 G6 refurbished. Intel Core i5-8265U, RAM 8GB, SSD 256GB.',
            ],
            // ---- MONITOR ----
            [
                'code' => 'PRD-00008', 'name' => 'Monitor LG 24" Full HD IPS 24MP60G',
                'category_id' => $cats['Monitor'] ?? 2, 'supplier_id' => $sups['SUP-004'] ?? 1,
                'purchase_price' => 1800000, 'selling_price' => 2150000,
                'stock' => 15, 'min_stock' => 5, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'Resolusi 1920x1080, panel IPS, 75Hz, AMD FreeSync.',
            ],
            [
                'code' => 'PRD-00009', 'name' => 'Monitor Samsung 27" Curved LC27F396',
                'category_id' => $cats['Monitor'] ?? 2, 'supplier_id' => $sups['SUP-004'] ?? 1,
                'purchase_price' => 2500000, 'selling_price' => 2990000,
                'stock' => 7, 'min_stock' => 3, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'Curved 1800R, resolusi 1920x1080, AMD FreeSync, 60Hz.',
            ],
            // ---- STORAGE ----
            [
                'code' => 'PRD-00010', 'name' => 'SSD Samsung 870 EVO 500GB',
                'category_id' => $cats['Storage'] ?? 3, 'supplier_id' => $sups['SUP-004'] ?? 1,
                'purchase_price' => 650000, 'selling_price' => 790000,
                'stock' => 25, 'min_stock' => 10, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'SATA III 2.5", kecepatan baca 560MB/s, tulis 530MB/s.',
            ],
            [
                'code' => 'PRD-00011', 'name' => 'SSD Samsung 980 Pro NVMe 1TB',
                'category_id' => $cats['Storage'] ?? 3, 'supplier_id' => $sups['SUP-004'] ?? 1,
                'purchase_price' => 1400000, 'selling_price' => 1700000,
                'stock' => 18, 'min_stock' => 5, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'M.2 NVMe PCIe 4.0, kecepatan baca 7000MB/s.',
            ],
            [
                'code' => 'PRD-00012', 'name' => 'HDD Seagate Barracuda 1TB',
                'category_id' => $cats['Storage'] ?? 3, 'supplier_id' => $sups['SUP-005'] ?? 1,
                'purchase_price' => 480000, 'selling_price' => 590000,
                'stock' => 1, 'min_stock' => 5, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'SATA III 3.5", 7200 RPM, cache 256MB. Stok hampir habis!',
            ],
            // ---- KOMPONEN PC ----
            [
                'code' => 'PRD-00013', 'name' => 'RAM Kingston DDR4 8GB 3200MHz',
                'category_id' => $cats['Komponen PC'] ?? 4, 'supplier_id' => $sups['SUP-005'] ?? 1,
                'purchase_price' => 280000, 'selling_price' => 350000,
                'stock' => 30, 'min_stock' => 10, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'SODIMM DDR4 3200MHz, kompatibel dengan laptop dan PC.',
            ],
            [
                'code' => 'PRD-00014', 'name' => 'RAM Corsair Vengeance DDR4 16GB',
                'category_id' => $cats['Komponen PC'] ?? 4, 'supplier_id' => $sups['SUP-005'] ?? 1,
                'purchase_price' => 500000, 'selling_price' => 630000,
                'stock' => 20, 'min_stock' => 8, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'DIMM DDR4 3200MHz (2x8GB), untuk PC desktop.',
            ],
            // ---- PERIPHERALS ----
            [
                'code' => 'PRD-00015', 'name' => 'Keyboard Mechanical Logitech G413',
                'category_id' => $cats['Peripherals'] ?? 5, 'supplier_id' => $sups['SUP-007'] ?? 1,
                'purchase_price' => 650000, 'selling_price' => 800000,
                'stock' => 10, 'min_stock' => 4, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'Mechanical gaming keyboard, Romer-G switch, backlight.',
            ],
            [
                'code' => 'PRD-00016', 'name' => 'Mouse Wireless Logitech MX Master 3',
                'category_id' => $cats['Peripherals'] ?? 5, 'supplier_id' => $sups['SUP-007'] ?? 1,
                'purchase_price' => 700000, 'selling_price' => 890000,
                'stock' => 6, 'min_stock' => 3, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'Wireless mouse untuk produktivitas, DPI hingga 4000.',
            ],
            [
                'code' => 'PRD-00017', 'name' => 'Headset Gaming HyperX Cloud II',
                'category_id' => $cats['Peripherals'] ?? 5, 'supplier_id' => $sups['SUP-005'] ?? 1,
                'purchase_price' => 750000, 'selling_price' => 950000,
                'stock' => 8, 'min_stock' => 3, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'Surround sound 7.1, driver 53mm, mikrofon noise cancelling.',
            ],
            // ---- NETWORKING ----
            [
                'code' => 'PRD-00018', 'name' => 'Router TP-Link Archer AX23',
                'category_id' => $cats['Networking'] ?? 6, 'supplier_id' => $sups['SUP-005'] ?? 1,
                'purchase_price' => 420000, 'selling_price' => 530000,
                'stock' => 12, 'min_stock' => 5, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'WiFi 6 AX1800 dual-band, 4 antena eksternal.',
            ],
            // ---- AKSESORIS ----
            [
                'code' => 'PRD-00019', 'name' => 'Tas Laptop ASUS TUF 15.6"',
                'category_id' => $cats['Aksesoris'] ?? 7, 'supplier_id' => $sups['SUP-002'] ?? 1,
                'purchase_price' => 180000, 'selling_price' => 245000,
                'stock' => 20, 'min_stock' => 8, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'Ransel gaming tahan air, kompartemen laptop 15.6".',
            ],
            [
                'code' => 'PRD-00020', 'name' => 'USB Hub 7-Port Anker A8352',
                'category_id' => $cats['Aksesoris'] ?? 7, 'supplier_id' => $sups['SUP-005'] ?? 1,
                'purchase_price' => 220000, 'selling_price' => 285000,
                'stock' => 14, 'min_stock' => 5, 'condition' => 'baru', 'status' => 'aktif',
                'description' => 'USB 3.0 hub 7-port, plug and play, kecepatan transfer 5Gbps.',
            ],
            // ---- INACTIVE PRODUCT ----
            [
                'code' => 'PRD-00021', 'name' => 'Printer Canon PIXMA iP2870S (Discontinue)',
                'category_id' => $cats['Printer'] ?? 8, 'supplier_id' => $sups['SUP-005'] ?? 1,
                'purchase_price' => 400000, 'selling_price' => 500000,
                'stock' => 0, 'min_stock' => 2, 'condition' => 'baru', 'status' => 'nonaktif',
                'description' => 'Produk sudah tidak dijual. Stok habis.',
            ],
        ];

        foreach ($products as $prod) {
            Product::updateOrCreate(
                ['code' => $prod['code']],
                array_merge($prod, ['image' => null])
            );
        }

        $this->command->info('Products seeded: ' . count($products) . ' records.');
    }
}
