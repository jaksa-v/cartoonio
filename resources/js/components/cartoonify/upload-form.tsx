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
import { type CartoonStyle } from '@/types';
import { type UseFormReturn } from '@inertiajs/react';

interface UploadFormProps {
    styles: CartoonStyle[];
    form: UseFormReturn<{
        photo: File | null;
        style_key: string;
    }>;
    previewUrl: string | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function UploadForm({
    styles,
    form,
    previewUrl,
    fileInputRef,
    onFileChange,
    onSubmit,
}: UploadFormProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload Photo</CardTitle>
                <CardDescription>
                    Upload a photo and choose a cartoon style to transform it
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-8 lg:grid-cols-2">
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="photo">Photo</Label>
                            <Input
                                id="photo"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={onFileChange}
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
    );
}
