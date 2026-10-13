<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'items'                => ['required', 'array', 'min:1'],
            'items.*.product_id'   => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'     => ['required', 'integer', 'min:1'],
            'discount'             => ['nullable', 'numeric', 'min:0'],
            'tax'                  => ['nullable', 'numeric', 'min:0'],
            'payment_method'       => ['required', 'in:tunai,transfer,debit,kartu_kredit'],
            'payment_amount'       => ['required', 'numeric', 'min:0'],
            'customer_name'        => ['nullable', 'string', 'max:100'],
            'note'                 => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required'            => 'Cart must have at least one item.',
            'items.*.product_id.exists' => 'One or more products do not exist.',
            'items.*.quantity.min'      => 'Quantity must be at least 1.',
        ];
    }
}
