<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingRequest;
use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    use ApiResponse;

    /**
     * Get all settings as a key-value object.
     * e.g. { store_name: "PRO.COM", store_address: "...", ... }
     */
    public function index(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key');

        return $this->success($settings);
    }

    /**
     * Update store settings.
     *
     * Uses upsert logic: if the key exists, update; if not, create.
     * Only known keys (store_name, store_address, store_phone, store_email) are accepted.
     *
     * Authorization: admin or owner only (enforced at route level).
     */
    public function update(UpdateSettingRequest $request): JsonResponse
    {
        $settingsMap = [
            'store_name'    => $request->store_name,
            'store_address' => $request->store_address,
            'store_phone'   => $request->store_phone,
            'store_email'   => $request->store_email,
        ];

        foreach ($settingsMap as $key => $value) {
            if ($request->has(str_replace('_', '_', $key))) {
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }
        }

        $updated = Setting::all()->pluck('value', 'key');

        return $this->success($updated, 'Settings updated successfully');
    }
}
