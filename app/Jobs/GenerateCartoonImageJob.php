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

        try {
            $styleConfig = config("cartoon_styles.{$generation->style_key}");

            if (! $styleConfig) {
                throw new \Exception("Style configuration not found for: {$generation->style_key}");
            }

            if (! $generation->original_path) {
                throw new \Exception('Original image path not found');
            }

            $imageContents = Storage::disk($generation->original_disk)->get($generation->original_path);

            if ($imageContents === false) {
                throw new \Exception('Failed to read original image file');
            }

            $mimeType = Storage::disk($generation->original_disk)->mimeType($generation->original_path) ?? 'image/png';
            $base64Image = base64_encode($imageContents);
            $dataUri = "data:{$mimeType};base64,{$base64Image}";

            $inputOptions = [
                'prompt' => $styleConfig['prompt'] ?? 'Transform this image into a cartoon style',
                'output_format' => 'jpg',
            ];

            $model = config('services.replicate.default_model');

            if (! $model) {
                throw new \Exception('Replicate model not configured');
            }

            $resultUrl = $replicateClient->runPrediction(
                $model,
                $dataUri,
                $inputOptions
            );

            if (! $resultUrl) {
                throw new \Exception('Failed to generate image from Replicate');
            }

            $resultContents = file_get_contents($resultUrl);

            if ($resultContents === false) {
                throw new \Exception('Failed to download result image');
            }

            $resultPath = 'generations/results/'.$generation->id.'_'.time().'.jpg';
            Storage::disk('public')->put($resultPath, $resultContents);

            $generation->update([
                'status' => GenerationStatus::Succeeded,
                'result_disk' => 'public',
                'result_path' => $resultPath,
            ]);
        } catch (\Exception $e) {
            Log::error('Generation failed', [
                'generation_id' => $this->generationId,
                'error' => $e->getMessage(),
            ]);

            $generation->update([
                'status' => GenerationStatus::Failed,
                'error' => substr($e->getMessage(), 0, 500),
            ]);
        }
    }
}
