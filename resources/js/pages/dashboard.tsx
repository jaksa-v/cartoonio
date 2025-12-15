import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome to Cartoonio!
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Transform your photos into amazing cartoon versions.
                        Upload an image and let our AI do the magic.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
