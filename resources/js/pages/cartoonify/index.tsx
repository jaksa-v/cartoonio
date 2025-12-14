import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Head, Link, router, useForm } from '@inertiajs/react';
import { MoreVertical, Trash2 } from 'lucide-react';
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
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [generationToDelete, setGenerationToDelete] = useState<number | null>(
        null,
    );

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
            preserveScroll: true,
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
            preserveScroll: true,
        });
    };

    const handleDeleteClick = (generationId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setGenerationToDelete(generationId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!generationToDelete) {
            return;
        }

        setDeletingId(generationToDelete);
        router.delete(`/cartoonify/${generationToDelete}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeletingId(null);
                setDeleteDialogOpen(false);
                setGenerationToDelete(null);
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
                        <div className="grid gap-8 lg:grid-cols-2">
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
                                        className="cursor-pointer"
                                    />
                                    {form.errors.photo && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.photo}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="style_key">
                                        Cartoon Style
                                    </Label>
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

                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full sm:w-auto"
                                >
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

                            <div className="flex flex-col">
                                <Label className="mb-1 text-sm font-medium">
                                    Preview
                                </Label>
                                {previewUrl ? (
                                    <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 p-4">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-h-80 w-full rounded-lg object-contain shadow-sm"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/20 p-12">
                                        <p className="text-center text-sm text-muted-foreground">
                                            Select a photo to see preview
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
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
                                <Link
                                    key={generation.id}
                                    href={`/cartoonify/${generation.id}`}
                                    className="block"
                                >
                                    <Card className="relative h-full transition-shadow hover:shadow-md">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">
                                                    {generation.style_label}
                                                </CardTitle>
                                                <div
                                                    className="flex items-center gap-2"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    {getStatusBadge(
                                                        generation.status,
                                                    )}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="size-8 p-0"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                }}
                                                            >
                                                                <MoreVertical className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleDeleteClick(
                                                                        generation.id,
                                                                        e,
                                                                    );
                                                                }}
                                                                disabled={
                                                                    deletingId ===
                                                                    generation.id
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 size-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                            <CardDescription>
                                                {new Date(
                                                    generation.created_at,
                                                ).toLocaleString()}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">
                                                        Original
                                                    </Label>
                                                    <div className="overflow-hidden rounded-lg border">
                                                        <img
                                                            src={
                                                                generation.original_url
                                                            }
                                                            alt="Original"
                                                            className="aspect-square w-full object-cover"
                                                        />
                                                    </div>
                                                </div>

                                                {generation.status ===
                                                    'succeeded' &&
                                                generation.result_url ? (
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">
                                                            Result
                                                        </Label>
                                                        <div className="overflow-hidden rounded-lg border">
                                                            <img
                                                                src={
                                                                    generation.result_url
                                                                }
                                                                alt="Result"
                                                                className="aspect-square w-full object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">
                                                            Result
                                                        </Label>
                                                        <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted">
                                                            {generation.status ===
                                                                'processing' && (
                                                                <Spinner className="size-6" />
                                                            )}
                                                            {generation.status ===
                                                                'queued' && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    Queued
                                                                </span>
                                                            )}
                                                            {generation.status ===
                                                                'failed' && (
                                                                <span className="text-xs text-destructive">
                                                                    Failed
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {generation.status === 'failed' &&
                                                generation.error && (
                                                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                                        {generation.error}
                                                    </div>
                                                )}

                                            {generation.status ===
                                                'succeeded' && (
                                                <div
                                                    className="space-y-2"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <Label className="text-xs">
                                                        Regenerate with
                                                        different style
                                                    </Label>
                                                    <Select
                                                        onValueChange={(
                                                            value,
                                                        ) => {
                                                            handleRegenerate(
                                                                generation,
                                                                value,
                                                            );
                                                        }}
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
                                                                .map(
                                                                    (style) => (
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
                                                                    ),
                                                                )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Generation</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this generation?
                                This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setGenerationToDelete(null);
                                }}
                                disabled={deletingId !== null}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                                disabled={deletingId !== null}
                            >
                                {deletingId !== null ? (
                                    <>
                                        <Spinner className="mr-2 size-4" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
