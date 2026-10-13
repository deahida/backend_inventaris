<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Depends on: employees
     *
     * One record per employee per day — enforced via unique composite index.
     *
     * Check-in and check-out are SEPARATE EVENTS stored in the SAME ROW.
     * The employee checks in first (populates check_in_* columns),
     * then later checks out (populates check_out_* columns).
     *
     * Evidence policy (from Phase 1 analysis):
     *   - Selfie (photo) is stored as FILE evidence ONLY
     *   - No facial recognition, no face matching fields
     *   - GPS coordinates stored as evidence only (not processed server-side beyond distance check)
     *
     * Status for admin-manual entries (izin, sakit, alpha) will have
     * NULL check_in_at and NULL check_in_photo — that is intentional.
     *
     * Deletion behavior:
     *   - employee_id: CASCADE — if an employee is deleted, their attendance records are removed
     *     (In practice, employees should be deactivated, not deleted)
     */
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained('employees')
                ->cascadeOnDelete();

            // Date of attendance (YYYY-MM-DD) — plain date, no time component
            $table->date('date');

            // hadir | terlambat | izin | sakit | alpha
            $table->enum('status', ['hadir', 'terlambat', 'izin', 'sakit', 'alpha']);

            // ================================================================
            // CHECK-IN DATA
            // ================================================================

            // Timestamp when check-in occurred
            $table->dateTime('check_in_at')->nullable();

            // Path to stored selfie photo (evidence only — no face matching)
            $table->string('check_in_photo')->nullable();

            // GPS coordinates at time of check-in
            $table->decimal('check_in_latitude', 10, 7)->nullable();
            $table->decimal('check_in_longitude', 10, 7)->nullable();

            // Calculated distance from store in meters at check-in
            $table->integer('check_in_distance')->nullable();

            // ================================================================
            // CHECK-OUT DATA
            // ================================================================

            // Timestamp when check-out occurred
            $table->dateTime('check_out_at')->nullable();

            // Path to stored selfie photo (evidence only — no face matching)
            $table->string('check_out_photo')->nullable();

            // GPS coordinates at time of check-out
            $table->decimal('check_out_latitude', 10, 7)->nullable();
            $table->decimal('check_out_longitude', 10, 7)->nullable();

            // Calculated distance from store in meters at check-out
            $table->integer('check_out_distance')->nullable();

            // ================================================================
            // NOTES
            // ================================================================

            // Optional note (for izin/sakit reason, or admin override note)
            $table->text('note')->nullable();

            $table->timestamps();

            // CRITICAL: One employee can have at most one record per day
            $table->unique(['employee_id', 'date']);

            // Index for date-range queries (attendance reports, today's overview)
            $table->index('date');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
