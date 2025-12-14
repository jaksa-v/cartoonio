<?php

namespace App\Http\Controllers;

use App\Enums\GenerationStatus;
use App\Http\Requests\CartoonifyRequest;
use App\Jobs\GenerateCartoonImageJob;
use App\Models\Generation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CartoonifyController extends Controller
{
    public function index(Request $request): Response
    {
        $styles = collect(config('cartoon_styles', []))
            ->map(fn ($style, $key) => [
                'key' => $key,
                'label' => $style['label'],
            ])
            ->values();

        $generations = Generation::where('user_id', $request->user()->id)
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn ($generation) => [
                'id' => $generation->id,
                'style_key' => $generation->style_key,
                'style_label' => config("cartoon_styles.{$generation->style_key}.label", $generation->style_key),
                'original_url' => $generation->original_url,
                'result_url' => $generation->result_url,
                'status' => $generation->status->value,
                'error' => $generation->error,
                'created_at' => $generation->created_at,
            ]);

        return Inertia::render('cartoonify/index', [
            'styles' => $styles,
            'generations' => $generations,
        ]);
    }

    public function store(CartoonifyRequest $request): RedirectResponse
    {
        $file = $request->file('photo');
        $styleKey = $request->validated()['style_key'];

        $originalPath = $file->store('generations/originals', 'public');

        $generation = Generation::create([
            'user_id' => $request->user()->id,
            'style_key' => $styleKey,
            'original_disk' => 'public',
            'original_path' => $originalPath,
            'status' => GenerationStatus::Queued,
        ]);

        GenerateCartoonImageJob::dispatch($generation->id);

        return redirect()->route('cartoonify.index');
    }

    public function show(Request $request, Generation $generation): Response
    {
        if ($generation->user_id !== $request->user()->id) {
            abort(403);
        }

        $styles = collect(config('cartoon_styles', []))
            ->map(fn ($style, $key) => [
                'key' => $key,
                'label' => $style['label'],
            ])
            ->values();

        $generationData = [
            'id' => $generation->id,
            'style_key' => $generation->style_key,
            'style_label' => config("cartoon_styles.{$generation->style_key}.label", $generation->style_key),
            'original_url' => $generation->original_url,
            'result_url' => $generation->result_url,
            'status' => $generation->status->value,
            'error' => $generation->error,
            'created_at' => $generation->created_at,
        ];

        return Inertia::render('cartoonify/show', [
            'generation' => $generationData,
            'styles' => $styles,
        ]);
    }

    public function destroy(Request $request, Generation $generation): RedirectResponse
    {
        if ($generation->user_id !== $request->user()->id) {
            abort(403);
        }

        $generation->delete();

        return redirect()->route('cartoonify.index');
    }

    public function regenerate(Request $request, Generation $generation): RedirectResponse
    {
        $request->validate([
            'style_key' => ['required', 'string', Rule::in(array_keys(config('cartoon_styles', [])))],
        ]);

        if ($generation->user_id !== $request->user()->id) {
            abort(403);
        }

        $newGeneration = Generation::create([
            'user_id' => $request->user()->id,
            'style_key' => $request->style_key,
            'original_disk' => $generation->original_disk,
            'original_path' => $generation->original_path,
            'status' => GenerationStatus::Queued,
        ]);

        GenerateCartoonImageJob::dispatch($newGeneration->id);

        return redirect()->route('cartoonify.index');
    }
}
