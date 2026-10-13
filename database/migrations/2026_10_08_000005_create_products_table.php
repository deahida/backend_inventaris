<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Depends on: categories, suppliers
     *
     * Deletion behavior:
     * - Deleting a category is BLOCKED if products exist (restrictOnDelete)
     * - Deleting a supplier is BLOCKED if products exist (restrictOnDelete)
     *
     * This prevents orphaned product records and matches the frontend business
     * rule where the context refuses to delete a category/supplier in use.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            // Auto-generated product code (PRD-00001, PRD-00002, ...)
            $table->string('code', 20)->unique();

            $table->string('name');

            $table->foreignId('category_id')
                ->constrained('categories')
                ->restrictOnDelete();

            $table->foreignId('supplier_id')
                ->constrained('suppliers')
                ->restrictOnDelete();

            // Prices: 15 digits total, 2 decimal places — supports up to 9,999,999,999,999.99
            $table->decimal('purchase_price', 15, 2)->default(0);
            $table->decimal('selling_price', 15, 2)->default(0);

            // Stock levels
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(0);

            // Physical condition: baru | bekas | refurbished
            $table->enum('condition', ['baru', 'bekas', 'refurbished'])->default('baru');

            // Listing status: aktif | nonaktif
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');

            $table->text('description')->nullable();

            // Path to product image in storage
            $table->string('image')->nullable();

            $table->timestamps();

            // Indexes for common filters
            $table->index('status');
            $table->index('condition');
            $table->index('category_id');
            $table->index('supplier_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
