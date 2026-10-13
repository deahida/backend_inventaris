<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * employees must be created BEFORE users
     * because users has a nullable FK to employees.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();

            // Auto-generated employee identifier (EMP-001, EMP-002, ...)
            $table->string('employee_id', 20)->unique();

            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone', 25)->nullable();

            // Position label (e.g. "Kasir", "Administrator", "Pemilik")
            $table->string('position', 100)->nullable();

            $table->text('address')->nullable();
            $table->date('join_date')->nullable();

            // aktif | nonaktif
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');

            // Optional profile photo path
            $table->string('avatar')->nullable();

            $table->timestamps();

            // Index for quick lookups by status
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
