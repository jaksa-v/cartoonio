<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CartoonifyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $styles = array_keys(config('cartoon_styles', []));

        return [
            'photo' => ['required', 'image', 'max:10240'],
            'style_key' => ['required', 'string', Rule::in($styles)],
        ];
    }
}
