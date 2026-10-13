<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * No foreign keys here — suppliers is a root table.
     */
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();

            // Auto-generated supplier code (SUP-001, SUP-002, ...)
            $table->string('code', 20)->unique();

            $table->string('name');
            $table->string('phone', 25)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();

            // Primary contact person at the supplier
            $table->string('contact_person', 100)->nullable();

            // aktif | nonaktif
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');

            $table->timestamps();

            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
