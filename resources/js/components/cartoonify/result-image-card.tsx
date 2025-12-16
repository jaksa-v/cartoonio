import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { type Generation } from '@/types';

interface ResultImageCardProps {
    generation: Generation;
}

export function ResultImageCard({ generation }: ResultImageCardProps) {
    const isSucceeded =
        generation.status === 'succeeded' && generation.result_url;
    const isProcessing = generation.status === 'processing';
    const isQueued = generation.status === 'queued';
    const isFailed = generation.status === 'failed';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {isSucceeded ? 'Cartoonified Result' : 'Result'}
                </CardTitle>
                <CardDescription>
                    {isSucceeded
                        ? `Style: ${generation.style_label}`
                        : 'Processing your image...'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isSucceeded ? (
                    <div className="group relative max-h-[60vh] overflow-hidden rounded-lg border-2 bg-gradient-to-br from-primary/5 to-primary/10 p-2 transition-all hover:border-primary/50">
                        <img
                            src={generation.result_url!}
                            alt="Result"
                            className="h-full w-full rounded-lg object-contain shadow-lg transition-transform group-hover:scale-[1.02]"
                        />
                    </div>
                ) : isProcessing ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 p-12">
                        <Spinner className="mb-4 size-12 text-primary" />
                        <p className="text-center font-medium">
                            Processing your image...
                        </p>
                        <p className="mt-2 text-center text-sm text-muted-foreground">
                            This may take a few moments
                        </p>
                    </div>
                ) : isQueued ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 p-12">
                        <div className="mb-4 size-12 rounded-full border-4 border-primary/20 border-t-primary" />
                        <p className="text-center font-medium">
                            Queued for processing
                        </p>
                        <p className="mt-2 text-center text-sm text-muted-foreground">
                            Your image is in the queue
                        </p>
                    </div>
                ) : isFailed ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-destructive/20 bg-destructive/5 p-12">
                        <div className="mb-4 size-12 rounded-full bg-destructive/10 p-3">
                            <svg
                                className="size-full text-destructive"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <p className="text-center font-medium text-destructive">
                            Processing Failed
                        </p>
                        {generation.error && (
                            <p className="mt-2 text-center text-sm text-destructive/80">
                                {generation.error}
                            </p>
                        )}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
