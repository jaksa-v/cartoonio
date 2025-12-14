import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Download, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: (generationId: number) => BreadcrumbItem[] = (
    generationId,
) => [
    {
        title: 'Cartoonify',
        href: '/cartoonify',
    },
    {
        title: `Generation #${generationId}`,
        href: `/cartoonify/${generationId}`,
    },
];

interface Style {
    key: string;
    label: string;
}

interface Generation {
    id: number;
    style_key: string;
    style_label: string;
    original_url: string;
    result_url: string | null;
    status: 'queued' | 'processing' | 'succeeded' | 'failed';
    error: string | null;
    created_at: string;
}

interface Props {
    generation: Generation;
    styles: Style[];
}

export default function CartoonifyShow({ generation, styles }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleRegenerate = (styleKey: string) => {
        router.post(`/cartoonify/${generation.id}/regenerate`, {
            style_key: styleKey,
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (
            !confirm(
                'Are you sure you want to delete this generation? This action cannot be undone.',
            )
        ) {
            return;
        }

        setIsDeleting(true);
        router.delete(`/cartoonify/${generation.id}`, {
            preserveScroll: true,
            onFinish: () => setIsDeleting(false),
            onSuccess: () => {
                router.visit('/cartoonify');
            },
        });
    };

    const getStatusBadge = (status: Generation['status']) => {
        const variants = {
            queued: 'secondary',
            processing: 'default',
            succeeded: 'default',
            failed: 'destructive',
        } as const;

        return (
            <Badge variant={variants[status]}>
                {status === 'queued' && 'Queued'}
                {status === 'processing' && (
                    <>
                        <Spinner className="size-3" />
                        Processing
                    </>
                )}
                {status === 'succeeded' && 'Completed'}
                {status === 'failed' && 'Failed'}
            </Badge>
        );
    };

    const handleDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(generation.id)}>
            <Head title={`Generation #${generation.id}`} />
            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto rounded-xl p-4">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="size-8"
                            >
                                <Link href="/cartoonify">
                                    <ArrowLeft className="size-4" />
                                </Link>
                            </Button>
                            <h1 className="text-3xl font-bold">
                                Generation #{generation.id}
                            </h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 pl-11">
                            <p className="text-sm text-muted-foreground">
                                {new Date(
                                    generation.created_at,
                                ).toLocaleString()}
                            </p>
                            <span className="text-muted-foreground">•</span>
                            <Badge variant="outline" className="font-normal">
                                {generation.style_key}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pl-11 sm:pl-0">
                        {getStatusBadge(generation.status)}
                        {generation.status === 'succeeded' &&
                            generation.result_url && (
                                <Button
                                    variant="outline"
                                    size="default"
                                    onClick={() =>
                                        handleDownload(
                                            generation.result_url!,
                                            `cartoon-${generation.id}.png`,
                                        )
                                    }
                                >
                                    <Download className="mr-2 size-4" />
                                    Download
                                </Button>
                            )}
                        <Button
                            variant="destructive"
                            size="default"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Spinner className="mr-2 size-4" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 size-4" />
                                    Delete
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Original Image Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Original Photo
                            </CardTitle>
                            <CardDescription>
                                Your uploaded image
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="group relative max-h-[60vh] overflow-hidden rounded-lg border-2 bg-muted/30 p-2 transition-all hover:border-primary/50">
                                <img
                                    src={generation.original_url}
                                    alt="Original"
                                    className="h-full w-full rounded-lg object-contain shadow-lg transition-transform group-hover:scale-[1.02]"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Result Image Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {generation.status === 'succeeded'
                                    ? 'Cartoonified Result'
                                    : 'Result'}
                            </CardTitle>
                            <CardDescription>
                                {generation.status === 'succeeded'
                                    ? `Style: ${generation.style_label}`
                                    : 'Processing your image...'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {generation.status === 'succeeded' &&
                            generation.result_url ? (
                                <div className="group relative max-h-[60vh] overflow-hidden rounded-lg border-2 bg-gradient-to-br from-primary/5 to-primary/10 p-2 transition-all hover:border-primary/50">
                                    <img
                                        src={generation.result_url}
                                        alt="Result"
                                        className="h-full w-full rounded-lg object-contain shadow-lg transition-transform group-hover:scale-[1.02]"
                                    />
                                </div>
                            ) : generation.status === 'processing' ? (
                                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 p-12">
                                    <Spinner className="mb-4 size-12 text-primary" />
                                    <p className="text-center font-medium">
                                        Processing your image...
                                    </p>
                                    <p className="mt-2 text-center text-sm text-muted-foreground">
                                        This may take a few moments
                                    </p>
                                </div>
                            ) : generation.status === 'queued' ? (
                                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 p-12">
                                    <div className="mb-4 size-12 rounded-full border-4 border-primary/20 border-t-primary" />
                                    <p className="text-center font-medium">
                                        Queued for processing
                                    </p>
                                    <p className="mt-2 text-center text-sm text-muted-foreground">
                                        Your image is in the queue
                                    </p>
                                </div>
                            ) : generation.status === 'failed' ? (
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
                </div>

                {/* Actions Section */}
                {generation.status === 'succeeded' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <RefreshCw className="size-5" />
                                Regenerate with Different Style
                            </CardTitle>
                            <CardDescription>
                                Try a different cartoon style on the same image
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Select a new style
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            handleRegenerate(value)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Choose a different style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {styles
                                                .filter(
                                                    (s) =>
                                                        s.key !==
                                                        generation.style_key,
                                                )
                                                .map((style) => (
                                                    <SelectItem
                                                        key={style.key}
                                                        value={style.key}
                                                    >
                                                        {style.label}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Back Button */}
                <div className="flex justify-start">
                    <Button variant="outline" size="default" asChild>
                        <Link href="/cartoonify">
                            <ArrowLeft className="mr-2 size-4" />
                            Back to Generations
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
