import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { type Generation } from '@/types';

interface StatusBadgeProps {
    status: Generation['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
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
}
