import { DeleteDialog } from '@/components/cartoonify/delete-dialog';
import { GenerationCard } from '@/components/cartoonify/generation-card';
import { UploadForm } from '@/components/cartoonify/upload-form';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import {
    type BreadcrumbItem,
    type CartoonStyle,
    type Generation,
} from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Cartoonify',
        href: '/cartoonify',
    },
];

interface Props {
    styles: CartoonStyle[];
    generations: Generation[];
}

export default function CartoonifyIndex({ styles, generations }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cartoonify" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <UploadForm
                    styles={styles}
                    form={form}
                    previewUrl={previewUrl}
                    fileInputRef={fileInputRef}
                    onFileChange={handleFileChange}
                    onSubmit={handleSubmit}
                />

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
                                <GenerationCard
                                    key={generation.id}
                                    generation={generation}
                                    styles={styles}
                                    onDelete={handleDeleteClick}
                                    onRegenerate={handleRegenerate}
                                    isDeleting={deletingId === generation.id}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <DeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onConfirm={handleDeleteConfirm}
                    isDeleting={deletingId !== null}
                />
            </div>
        </AppLayout>
    );
}
