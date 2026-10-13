<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($this->route('employee'))],
            'phone'     => ['nullable', 'string', 'max:25'],
            'position'  => ['nullable', 'string', 'max:100'],
            'address'   => ['nullable', 'string'],
            'join_date' => ['nullable', 'date'],
            'status'    => ['nullable', 'in:aktif,nonaktif'],
            'avatar'    => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }
}
