import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface ImageCardProps {
    title: string;
    description: string;
    imageUrl: string;
    alt: string;
}

export function ImageCard({
    title,
    description,
    imageUrl,
    alt,
}: ImageCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="group relative max-h-[60vh] overflow-hidden rounded-lg border-2 bg-muted/30 p-2 transition-all hover:border-primary/50">
                    <img
                        src={imageUrl}
                        alt={alt}
                        className="h-full w-full rounded-lg object-contain shadow-lg transition-transform group-hover:scale-[1.02]"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
