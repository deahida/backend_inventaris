<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Depends on: sales, products
     *
     * sale_items stores a SNAPSHOT of product data at time of sale.
     * product_code and product_name are stored directly because:
     *   - The product name/code may change after the sale
     *   - Sales history must remain accurate even if products are edited
     *
     * Deletion behavior:
     *   - sale_id: CASCADE — items are meaningless without the parent sale
     *   - product_id: RESTRICT — do not allow product deletion if sale items reference it
     *
     * Note on product_id:
     *   While product_code and product_name are snapshotted, we keep product_id
     *   for reporting purposes (e.g. "which product was most sold?").
     *   If the product is deleted, this FK prevents it — consistent with the
     *   frontend behavior of blocking product deletion once it has been sold.
     */
    public function up(): void
    {
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('sale_id')
                ->constrained('sales')
                ->cascadeOnDelete();

            $table->foreignId('product_id')
                ->constrained('products')
                ->restrictOnDelete();

            // Snapshot of product code at time of sale
            $table->string('product_code', 20);

            // Snapshot of product name at time of sale
            $table->string('product_name');

            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('subtotal', 15, 2);

            $table->timestamps();

            $table->index('sale_id');
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};
