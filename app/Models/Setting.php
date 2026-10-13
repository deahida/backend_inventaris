<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * PRO.COM Setting model.
 *
 * Key-value store for application configuration.
 * The "key" column is unique at the database level.
 *
 * Current supported keys:
 *   store_name         → "PRO.COM"
 *   store_address      → "Jl. Sunan Muria No. 27A, Kudus"
 *   store_phone        → "021-5551234"
 *   store_email        → "info@procom.com"
 *
 * Future extensible keys (no schema change needed):
 *   geofence_latitude  → "-6.802766454110481"
 *   geofence_longitude → "110.84381260861629"
 *   geofence_radius    → "200"
 *
 * Values are stored as text to support all data types.
 * Type conversion should be handled in the service/controller layer
 * based on the expected type of each key.
 *
 * Mass-assignable:
 *   key, value
 *
 * @property int         $id
 * @property string      $key    Unique configuration key (snake_case)
 * @property string|null $value  Configuration value (text)
 */
#[Fillable(['key', 'value'])]
class Setting extends Model
{
    use HasFactory;

    // No relationships required — this is a standalone configuration table.
    // No complex casts required — values are text; type conversion
    // is the responsibility of the consuming controller/service.
}
