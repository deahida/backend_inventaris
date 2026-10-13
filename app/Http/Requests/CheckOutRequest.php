<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckOutRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'photo'     => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'latitude'  => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ];
    }

    public function messages(): array
    {
        return [
            'photo.required' => 'Selfie photo is required for check-out.',
            'latitude.required'  => 'GPS latitude is required.',
            'longitude.required' => 'GPS longitude is required.',
        ];
    }
}
