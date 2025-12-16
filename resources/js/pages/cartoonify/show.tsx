import { ImageCard } from '@/components/cartoonify/image-card';
import { RegenerateForm } from '@/components/cartoonify/regenerate-form';
import { ResultImageCard } from '@/components/cartoonify/result-image-card';
import { StatusBadge } from '@/components/cartoonify/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import {
    type BreadcrumbItem,
    type CartoonStyle,
    type Generation,
} from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
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

interface Props {
    generation: Generation;
    styles: CartoonStyle[];
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
                        <StatusBadge status={generation.status} />
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
                    <ImageCard
                        title="Original Photo"
                        description="Your uploaded image"
                        imageUrl={generation.original_url}
                        alt="Original"
                    />

                    <ResultImageCard generation={generation} />
                </div>

                {/* Actions Section */}
                {generation.status === 'succeeded' && (
                    <RegenerateForm
                        styles={styles}
                        currentStyleKey={generation.style_key}
                        onRegenerate={handleRegenerate}
                    />
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
