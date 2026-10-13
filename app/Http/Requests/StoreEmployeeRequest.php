<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255', 'unique:employees,email'],
            'phone'     => ['nullable', 'string', 'max:25'],
            'position'  => ['nullable', 'string', 'max:100'],
            'address'   => ['nullable', 'string'],
            'join_date' => ['nullable', 'date'],
            'status'    => ['nullable', 'in:aktif,nonaktif'],
            'avatar'    => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            // Optional: create a linked user account
            'create_user' => ['nullable', 'boolean'],
            'role'        => ['nullable', 'required_if:create_user,true', 'in:admin,cashier,owner'],
            'password'    => ['nullable', 'required_if:create_user,true', 'string', 'min:8'],
        ];
    }
}
