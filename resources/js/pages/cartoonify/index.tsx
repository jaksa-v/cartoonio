import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Cartoonify',
        href: '/cartoonify',
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
    styles: Style[];
    generations: Generation[];
}

export default function CartoonifyIndex({ styles, generations }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm({
        photo: null as File | null,
        style_key: '',
    });

    // Check if there are any pending generations
    const hasPendingGenerations = generations.some(
        (g) => g.status === 'queued' || g.status === 'processing',
    );

    // Poll for updates when there are pending generations
    useEffect(() => {
        if (!hasPendingGenerations) {
            return;
        }

        const interval = setInterval(() => {
            router.reload({ only: ['generations'] });
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [hasPendingGenerations]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('photo', file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.data.photo || !form.data.style_key) {
            return;
        }

        form.post('/cartoonify', {
            forceFormData: true,
            onSuccess: () => {
                setPreviewUrl(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                form.reset();
            },
        });
    };

    const handleRegenerate = (generation: Generation, styleKey: string) => {
        router.post(`/cartoonify/${generation.id}/regenerate`, {
            style_key: styleKey,
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cartoonify" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Photo</CardTitle>
                        <CardDescription>
                            Upload a photo and choose a cartoon style to
                            transform it
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="photo">Photo</Label>
                                <Input
                                    id="photo"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={form.processing}
                                />
                                {previewUrl && (
                                    <div className="mt-4">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-h-64 rounded-lg border"
                                        />
                                    </div>
                                )}
                                {form.errors.photo && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.photo}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="style_key">Cartoon Style</Label>
                                <Select
                                    value={form.data.style_key}
                                    onValueChange={(value) =>
                                        form.setData('style_key', value)
                                    }
                                    disabled={form.processing}
                                >
                                    <SelectTrigger id="style_key">
                                        <SelectValue placeholder="Select a style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {styles.map((style) => (
                                            <SelectItem
                                                key={style.key}
                                                value={style.key}
                                            >
                                                {style.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.style_key && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.style_key}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? (
                                    <>
                                        <Spinner className="mr-2 size-4" />
                                        Processing...
                                    </>
                                ) : (
                                    'Generate'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        Recent Generations
                    </h2>
                    {generations.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No generations yet. Upload a photo to get
                                started!
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {generations.map((generation) => (
                                <Card key={generation.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">
                                                {generation.style_label}
                                            </CardTitle>
                                            {getStatusBadge(generation.status)}
                                        </div>
                                        <CardDescription>
                                            {new Date(
                                                generation.created_at,
                                            ).toLocaleString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">
                                                Original
                                            </Label>
                                            <img
                                                src={generation.original_url}
                                                alt="Original"
                                                className="w-full rounded-lg border"
                                            />
                                        </div>

                                        {generation.status === 'succeeded' &&
                                            generation.result_url && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs">
                                                        Result
                                                    </Label>
                                                    <img
                                                        src={
                                                            generation.result_url
                                                        }
                                                        alt="Result"
                                                        className="w-full rounded-lg border"
                                                    />
                                                </div>
                                            )}

                                        {generation.status === 'processing' && (
                                            <div className="flex items-center justify-center py-8">
                                                <Spinner className="size-8" />
                                            </div>
                                        )}

                                        {generation.status === 'failed' &&
                                            generation.error && (
                                                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                                    {generation.error}
                                                </div>
                                            )}

                                        {generation.status === 'succeeded' && (
                                            <div className="space-y-2">
                                                <Label className="text-xs">
                                                    Regenerate with different
                                                    style
                                                </Label>
                                                <Select
                                                    onValueChange={(value) =>
                                                        handleRegenerate(
                                                            generation,
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose style" />
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
                                                                    key={
                                                                        style.key
                                                                    }
                                                                    value={
                                                                        style.key
                                                                    }
                                                                >
                                                                    {
                                                                        style.label
                                                                    }
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
