<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Key-value store for application settings.
     *
     * Designed to support current settings (store info) and future
     * configuration such as geofence parameters — without schema changes.
     *
     * Examples:
     *   store_name     => "PRO.COM"
     *   store_address  => "Jl. Sunan Muria No. 27A, Kudus"
     *   store_phone    => "021-5551234"
     *   store_email    => "info@procom.com"
     *   geofence_latitude  => "-6.802766454110481"
     *   geofence_longitude => "110.84381260861629"
     *   geofence_radius    => "200"
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();

            // Unique setting key (snake_case)
            $table->string('key', 100)->unique();

            // Value stored as text to support all data types
            $table->text('value')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
