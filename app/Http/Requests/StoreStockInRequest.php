<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockInRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'supplier_id'          => ['required', 'integer', 'exists:suppliers,id'],
            'date'                 => ['required', 'date'],
            'reference'            => ['nullable', 'string', 'max:100'],
            'items'                => ['required', 'array', 'min:1'],
            'items.*.product_id'   => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'     => ['required', 'integer', 'min:1'],
            'items.*.unit_price'   => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required'             => 'At least one item is required.',
            'items.*.product_id.exists'  => 'One or more products do not exist.',
            'items.*.quantity.min'       => 'Quantity must be at least 1.',
        ];
    }
}
