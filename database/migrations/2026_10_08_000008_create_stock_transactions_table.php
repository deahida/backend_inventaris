<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Depends on: products, users, suppliers
     *
     * stock_transactions is the unified ledger of ALL stock movements:
     *   - masuk     : stock received from supplier (via stock_in_headers)
     *   - keluar    : stock removed manually (damage, internal use, etc.)
     *   - penjualan : stock deducted due to a sale
     *   - penyesuaian: manual adjustment (stock opname correction)
     *
     * IMPORTANT:
     *   - quantity is ALWAYS stored as a positive integer.
     *   - The "type" field determines the direction of the movement.
     *   - Do NOT store negative quantities here.
     *
     * Deletion behavior:
     *   - product_id: RESTRICT — stock history must never lose its product reference
     *   - user_id:    SET NULL — user can be removed but record is kept for audit
     *   - supplier_id: SET NULL — supplier-specific only for 'masuk' type; optional
     */
    public function up(): void
    {
        Schema::create('stock_transactions', function (Blueprint $table) {
            $table->id();

            // Transaction date (may differ from created_at for backdated entries)
            $table->date('date');

            $table->foreignId('product_id')
                ->constrained('products')
                ->restrictOnDelete();

            // masuk | keluar | penjualan | penyesuaian
            $table->enum('type', ['masuk', 'keluar', 'penjualan', 'penyesuaian']);

            // Always positive — type determines direction
            $table->integer('quantity');

            // Stock snapshot before this transaction
            $table->integer('stock_before');

            // Stock snapshot after this transaction
            $table->integer('stock_after');

            // Reference: invoice number, PO number, sale invoice, etc.
            $table->string('reference', 100)->nullable();

            // Human-readable note / reason
            $table->text('notes')->nullable();

            // Who triggered this transaction (nullable for system-generated entries)
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Relevant only for 'masuk' type transactions
            $table->foreignId('supplier_id')
                ->nullable()
                ->constrained('suppliers')
                ->nullOnDelete();

            // Unit price at time of transaction (purchase price for masuk, selling price for penjualan)
            $table->decimal('unit_price', 15, 2)->nullable();

            // Specific reason for 'keluar' or 'penyesuaian' (e.g. "Barang rusak/display")
            $table->string('reason', 255)->nullable();

            $table->timestamps();

            // Indexes for common queries (stock history, reports)
            $table->index('date');
            $table->index('product_id');
            $table->index('type');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_transactions');
    }
};
