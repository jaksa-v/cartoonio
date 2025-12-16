import { StatusBadge } from '@/components/cartoonify/status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { type CartoonStyle, type Generation } from '@/types';
import { Link } from '@inertiajs/react';
import { MoreVertical, Trash2 } from 'lucide-react';

interface GenerationCardProps {
    generation: Generation;
    styles: CartoonStyle[];
    onDelete: (generationId: number, e: React.MouseEvent) => void;
    onRegenerate: (generation: Generation, styleKey: string) => void;
    isDeleting: boolean;
}

export function GenerationCard({
    generation,
    styles,
    onDelete,
    onRegenerate,
    isDeleting,
}: GenerationCardProps) {
    return (
        <Link href={`/cartoonify/${generation.id}`} className="block">
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
                            <StatusBadge status={generation.status} />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="size-8 p-0"
                                        onClick={(e) => {
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
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onDelete(generation.id, e);
                                        }}
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="mr-2 size-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <CardDescription>
                        {new Date(generation.created_at).toLocaleString()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label className="text-xs">Original</Label>
                            <div className="overflow-hidden rounded-lg border">
                                <img
                                    src={generation.original_url}
                                    alt="Original"
                                    className="aspect-square w-full object-cover"
                                />
                            </div>
                        </div>

                        {generation.status === 'succeeded' &&
                        generation.result_url ? (
                            <div className="space-y-2">
                                <Label className="text-xs">Result</Label>
                                <div className="overflow-hidden rounded-lg border">
                                    <img
                                        src={generation.result_url}
                                        alt="Result"
                                        className="aspect-square w-full object-cover"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label className="text-xs">Result</Label>
                                <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted">
                                    {generation.status === 'processing' && (
                                        <Spinner className="size-6" />
                                    )}
                                    {generation.status === 'queued' && (
                                        <span className="text-xs text-muted-foreground">
                                            Queued
                                        </span>
                                    )}
                                    {generation.status === 'failed' && (
                                        <span className="text-xs text-destructive">
                                            Failed
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {generation.status === 'failed' && generation.error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {generation.error}
                        </div>
                    )}

                    {generation.status === 'succeeded' && (
                        <div
                            className="space-y-2"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            <Label className="text-xs">
                                Regenerate with different style
                            </Label>
                            <Select
                                onValueChange={(value) => {
                                    onRegenerate(generation, value);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose style" />
                                </SelectTrigger>
                                <SelectContent>
                                    {styles
                                        .filter(
                                            (s) =>
                                                s.key !== generation.style_key,
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
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
