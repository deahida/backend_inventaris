<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'store_name'    => ['nullable', 'string', 'max:255'],
            'store_address' => ['nullable', 'string'],
            'store_phone'   => ['nullable', 'string', 'max:25'],
            'store_email'   => ['nullable', 'email', 'max:255'],
        ];
    }
}
