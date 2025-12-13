<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReplicateClient
{
    private string $apiToken;

    private string $baseUrl = 'https://api.replicate.com/v1';

    public function __construct()
    {
        $this->apiToken = config('services.replicate.api_token') ?? '';
    }

    public function runPrediction(string $model, string $imageUrl, array $options = []): ?string
    {
        try {
            $input = array_merge([
                'image_input' => [$imageUrl],
            ], $options);

            $requestBody = [
                'input' => $input,
            ];

            $response = Http::withHeaders([
                'Authorization' => "Token {$this->apiToken}",
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/models/{$model}/predictions", $requestBody);

            if (! $response->successful()) {
                Log::error('Replicate API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            }

            $prediction = $response->json();

            // Poll for completion
            return $this->waitForCompletion($prediction['urls']['get']);
        } catch (\Exception $e) {
            Log::error('Replicate API exception', [
                'message' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function waitForCompletion(string $predictionUrl, int $maxAttempts = 60, int $delaySeconds = 2): ?string
    {
        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            $response = Http::withHeaders([
                'Authorization' => "Token {$this->apiToken}",
            ])->get($predictionUrl);

            if (! $response->successful()) {
                Log::error('Replicate prediction status error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            }

            $prediction = $response->json();
            $status = $prediction['status'] ?? 'unknown';

            if ($status === 'succeeded') {
                $output = $prediction['output'];

                if (is_array($output) && ! empty($output)) {
                    return $output[0];
                }

                return is_string($output) ? $output : null;
            }

            if ($status === 'failed' || $status === 'canceled') {
                $error = $prediction['error'] ?? 'Unknown error';
                Log::error('Replicate prediction failed', [
                    'status' => $status,
                    'error' => $error,
                ]);

                return null;
            }

            sleep($delaySeconds);
        }

        Log::warning('Replicate prediction timeout', [
            'url' => $predictionUrl,
            'attempts' => $maxAttempts,
        ]);

        return null;
    }
}
