<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Depends on: users, suppliers
     *
     * stock_in_headers represents a single receiving event (one PO delivery).
     * Each header can have multiple stock_in_items (products received in that delivery).
     *
     * Deletion behavior:
     * - User deletion: set user_id to NULL (the record remains for audit trail)
     * - Supplier deletion: BLOCKED if there are stock_in_headers referencing it
     */
    public function up(): void
    {
        Schema::create('stock_in_headers', function (Blueprint $table) {
            $table->id();

            // Date of the stock-in event (may differ from created_at)
            $table->date('date');

            $table->foreignId('supplier_id')
                ->constrained('suppliers')
                ->restrictOnDelete();

            // Reference number: PO number, delivery note, invoice from supplier, etc.
            $table->string('reference', 100)->nullable();

            // Total monetary value of this stock-in batch
            $table->decimal('total', 15, 2)->default(0);

            // Who recorded this stock-in
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index('date');
            $table->index('supplier_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_in_headers');
    }
};
