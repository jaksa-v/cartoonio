<?php

namespace App\Jobs;

use App\Enums\GenerationStatus;
use App\Models\Generation;
use App\Services\ReplicateClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GenerateCartoonImageJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $generationId
    ) {
        //
    }

    public function handle(ReplicateClient $replicateClient): void
    {
        $generation = Generation::find($this->generationId);

        if (! $generation) {
            Log::error('Generation not found', ['generation_id' => $this->generationId]);

            return;
        }

        $generation->update(['status' => GenerationStatus::Processing]);

        $styleConfig = config("cartoon_styles.{$generation->style_key}");

        if (! $styleConfig) {
            $this->markAsFailed($generation, "Style configuration not found for: {$generation->style_key}");

            return;
        }

        if (! $generation->original_path) {
            $this->markAsFailed($generation, 'Original image path not found');

            return;
        }

        $model = config('services.replicate.default_model');

        if (! $model) {
            $this->markAsFailed($generation, 'Replicate model not configured');

            return;
        }

        try {
            $imageContents = Storage::disk($generation->original_disk)->get($generation->original_path);

            if ($imageContents === false) {
                $this->markAsFailed($generation, 'Failed to read original image file');

                return;
            }

            $mimeType = Storage::disk($generation->original_disk)->mimeType($generation->original_path) ?? 'image/png';
            $base64Image = base64_encode($imageContents);
            $dataUri = "data:{$mimeType};base64,{$base64Image}";

            $inputOptions = [
                'prompt' => $styleConfig['prompt'] ?? 'Transform this image into a cartoon style',
                'output_format' => 'jpg',
            ];

            $resultUrl = $replicateClient->runPrediction(
                $model,
                $dataUri,
                $inputOptions
            );

            if (! $resultUrl) {
                $this->markAsFailed($generation, 'Failed to generate image from Replicate');

                return;
            }

            $resultContents = file_get_contents($resultUrl);

            if ($resultContents === false) {
                $this->markAsFailed($generation, 'Failed to download result image');

                return;
            }

            $resultPath = 'generations/results/'.$generation->id.'_'.time().'.jpg';
            Storage::disk('public')->put($resultPath, $resultContents);

            $generation->update([
                'status' => GenerationStatus::Succeeded,
                'result_disk' => 'public',
                'result_path' => $resultPath,
            ]);
        } catch (\Exception $e) {
            $this->markAsFailed($generation, $e->getMessage());
        }
    }

    private function markAsFailed(Generation $generation, string $error): void
    {
        Log::error('Generation failed', [
            'generation_id' => $generation->id,
            'error' => $error,
        ]);

        $generation->update([
            'status' => GenerationStatus::Failed,
            'error' => substr($error, 0, 500),
        ]);
    }
}
