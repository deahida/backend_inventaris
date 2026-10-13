<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockOutRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity'   => ['required', 'integer', 'min:1'],
            'date'       => ['required', 'date'],
            'reason'     => ['required', 'string', 'max:255'],
            'notes'      => ['nullable', 'string'],
            'reference'  => ['nullable', 'string', 'max:100'],
        ];
    }
}
