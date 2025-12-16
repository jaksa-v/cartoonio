<?php

namespace App\Http\Controllers;

use App\Enums\GenerationStatus;
use App\Http\Requests\CartoonifyRequest;
use App\Jobs\GenerateCartoonImageJob;
use App\Models\Generation;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
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
        $userId = $request->user()->id;

        $fileContents = file_get_contents($file->getRealPath());
        $encryptedContents = encrypt($fileContents);

        $filename = uniqid().'.'.$file->getClientOriginalExtension();
        $originalPath = "generations/{$userId}/originals/{$filename}";

        Storage::disk('s3')->put($originalPath, $encryptedContents, [
            'visibility' => 'private',
        ]);

        $generation = Generation::create([
            'user_id' => $userId,
            'style_key' => $styleKey,
            'original_disk' => 's3',
            'original_path' => $originalPath,
            'original_mime_type' => $file->getMimeType(),
            'status' => GenerationStatus::Queued,
        ]);

        GenerateCartoonImageJob::dispatch($generation->id);

        return redirect()->route('cartoonify.index');
    }

    public function show(Request $request, Generation $generation): Response
    {
        Gate::authorize('view', $generation);

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
        Gate::authorize('delete', $generation);

        $generation->delete();

        return redirect()->route('cartoonify.index');
    }

    public function regenerate(Request $request, Generation $generation): RedirectResponse
    {
        $validated = $request->validate([
            'style_key' => ['required', 'string', Rule::in(array_keys(config('cartoon_styles', [])))],
        ]);

        Gate::authorize('regenerate', $generation);

        $newGeneration = Generation::create([
            'user_id' => $request->user()->id,
            'style_key' => $validated['style_key'],
            'original_disk' => $generation->original_disk,
            'original_path' => $generation->original_path,
            'original_mime_type' => $generation->original_mime_type,
            'status' => GenerationStatus::Queued,
        ]);

        GenerateCartoonImageJob::dispatch($newGeneration->id);

        return redirect()->route('cartoonify.index');
    }

    public function serveFile(Request $request, Generation $generation, string $type)
    {
        Gate::authorize('view', $generation);

        if (! \in_array($type, ['original', 'result'])) {
            abort(404);
        }

        $path = $type === 'original' ? $generation->original_path : $generation->result_path;
        $disk = $type === 'original' ? $generation->original_disk : $generation->result_disk;
        $mimeType = $type === 'original' ? $generation->original_mime_type : $generation->result_mime_type;

        if (! $path || ! $disk || ! $mimeType) {
            abort(404);
        }

        if (! Storage::disk($disk)->exists($path)) {
            abort(404);
        }

        $encryptedContents = Storage::disk($disk)->get($path);

        if (! $encryptedContents) {
            abort(404);
        }

        try {
            $decryptedContents = decrypt($encryptedContents);
        } catch (DecryptException $e) {
            abort(500, 'Failed to decrypt file');
        }

        return response($decryptedContents)
            ->header('Content-Type', $mimeType)
            ->header('Content-Length', \strlen($decryptedContents))
            ->header('Cache-Control', 'private, max-age=604800');
    }
}
