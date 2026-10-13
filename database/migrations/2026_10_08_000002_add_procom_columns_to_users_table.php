<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Extend the existing users table with PRO.COM fields.
     *
     * The default Laravel users table (already applied) has:
     *   id, name, email, email_verified_at, password, remember_token, timestamps
     *
     * We add:
     *   phone, position, role, avatar, employee_id (nullable FK to employees)
     *
     * employees table must exist before this migration runs.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Phone number
            $table->string('phone', 25)->nullable()->after('email');

            // Position label (mirrors employee position for display)
            $table->string('position', 100)->nullable()->after('phone');

            // Role: admin | cashier | owner
            $table->enum('role', ['admin', 'cashier', 'owner'])->default('cashier')->after('position');

            // Optional avatar
            $table->string('avatar')->nullable()->after('role');

            // Optional link to the employees master data table.
            // A user can exist without an employee record (rare but valid).
            // An employee can exist without a user account.
            $table->foreignId('employee_id')
                ->nullable()
                ->after('avatar')
                ->constrained('employees')
                ->nullOnDelete();

            // Index for role-based queries
            $table->index('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->dropIndex(['role']);
            $table->dropColumn(['phone', 'position', 'role', 'avatar', 'employee_id']);
        });
    }
};
