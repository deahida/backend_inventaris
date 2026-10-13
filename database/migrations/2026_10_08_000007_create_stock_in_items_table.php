<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Depends on: stock_in_headers, products
     *
     * Each row represents one product line within a stock-in delivery.
     *
     * Deletion behavior:
     * - Deleting a stock_in_header CASCADES to its items (they have no meaning without the header)
     * - Deleting a product is BLOCKED if stock_in_items exist (audit trail must be preserved)
     */
    public function up(): void
    {
        Schema::create('stock_in_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('stock_in_header_id')
                ->constrained('stock_in_headers')
                ->cascadeOnDelete();

            $table->foreignId('product_id')
                ->constrained('products')
                ->restrictOnDelete();

            $table->integer('quantity');

            // Purchase price per unit for this specific delivery
            $table->decimal('unit_price', 15, 2)->default(0);

            $table->decimal('subtotal', 15, 2)->default(0);

            $table->timestamps();

            $table->index('stock_in_header_id');
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_in_items');
    }
};
