<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Depends on: users (cashier)
     *
     * A sale is created atomically — when a cashier completes a transaction.
     * The sale header stores financial totals and payment info.
     * Line items are stored in sale_items.
     *
     * Deletion behavior:
     *   - user_id (cashier): SET NULL — cashier record may be removed but sale history stays
     *   - sale_items CASCADES on sale delete (items have no meaning without the sale)
     */
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();

            // Auto-generated invoice: INV-YYMMDD-XXXX (e.g. INV-261008-0001)
            $table->string('invoice', 30)->unique();

            // Transaction datetime
            $table->dateTime('date');

            // Cashier who processed the sale
            $table->foreignId('cashier_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Financial totals
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);

            // Payment details
            $table->decimal('payment_amount', 15, 2)->default(0);
            $table->decimal('change', 15, 2)->default(0);

            // tunai | transfer | debit | kartu_kredit
            $table->enum('payment_method', ['tunai', 'transfer', 'debit', 'kartu_kredit'])->default('tunai');

            // selesai | dibatalkan | pending
            $table->enum('status', ['selesai', 'dibatalkan', 'pending'])->default('pending');

            // Optional customer name for receipts
            $table->string('customer_name', 100)->nullable();

            // Optional note / memo on the sale
            $table->text('note')->nullable();

            $table->timestamps();

            // Indexes for common report queries
            $table->index('date');
            $table->index('cashier_id');
            $table->index('status');
            $table->index('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
