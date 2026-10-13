<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupplierRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'phone'          => ['nullable', 'string', 'max:25'],
            'email'          => ['nullable', 'email', 'max:255'],
            'address'        => ['nullable', 'string'],
            'contact_person' => ['nullable', 'string', 'max:100'],
            'status'         => ['nullable', 'in:aktif,nonaktif'],
        ];
    }
}
