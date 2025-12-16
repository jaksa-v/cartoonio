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
import { type CartoonStyle } from '@/types';
import { RefreshCw } from 'lucide-react';

interface RegenerateFormProps {
    styles: CartoonStyle[];
    currentStyleKey: string;
    onRegenerate: (styleKey: string) => void;
}

export function RegenerateForm({
    styles,
    currentStyleKey,
    onRegenerate,
}: RegenerateFormProps) {
    return (
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
                        <Select onValueChange={(value) => onRegenerate(value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose a different style" />
                            </SelectTrigger>
                            <SelectContent>
                                {styles
                                    .filter((s) => s.key !== currentStyleKey)
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
    );
}
