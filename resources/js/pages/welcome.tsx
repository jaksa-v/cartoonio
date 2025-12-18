import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ImageIcon, Palette, Sparkles, Zap } from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    const styles = [
        'Anime',
        'Pixar',
        'Simpsons',
        'Family Guy',
        'South Park',
        'Rick and Morty',
    ];

    return (
        <>
            <Head title="Welcome to Cartoonio" />
            <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
                {/* Header */}
                <header className="container mx-auto flex items-center justify-between px-4 py-6">
                    <div className="flex items-center gap-2">
                        <img
                            src="/cartoonio192.png"
                            alt="Cartoonio"
                            className="size-10"
                        />
                        <span className="text-xl font-bold">Cartoonio</span>
                    </div>
                    <nav className="flex items-center gap-3">
                        {auth.user ? (
                            <Button asChild>
                                <Link href={dashboard()}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href={login()}>Log in</Link>
                                </Button>
                                {canRegister && (
                                    <Button asChild>
                                        <Link href={register()}>Sign up</Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero Section */}
                <section className="container mx-auto px-4 py-16 text-center lg:py-24">
                    <div className="mx-auto max-w-4xl space-y-6">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            Transform Your Photos Into{' '}
                            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                                Cartoons
                            </span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
                            Upload any photo and watch AI transform it into
                            stunning cartoon art in seconds. Choose from 10+
                            iconic animation styles.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                            {auth.user ? (
                                <Button size="lg" asChild>
                                    <Link href={dashboard()}>
                                        <Sparkles className="mr-2 size-5" />
                                        Start Creating
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button size="lg" asChild>
                                        <Link href={register()}>
                                            <Sparkles className="mr-2 size-5" />
                                            Get Started Free
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" asChild>
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="container mx-auto px-4 py-16">
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="space-y-3 rounded-lg border bg-card p-6">
                            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                                <Zap className="size-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">
                                Lightning Fast
                            </h3>
                            <p className="text-muted-foreground">
                                AI-powered transformation in seconds. Upload,
                                select a style, and get your cartoon instantly.
                            </p>
                        </div>
                        <div className="space-y-3 rounded-lg border bg-card p-6">
                            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                                <Palette className="size-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">
                                10+ Art Styles
                            </h3>
                            <p className="text-muted-foreground">
                                From Anime to Pixar, Simpsons to Rick and Morty.
                                Choose your favorite cartoon style.
                            </p>
                        </div>
                        <div className="space-y-3 rounded-lg border bg-card p-6">
                            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                                <ImageIcon className="size-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">High Quality</h3>
                            <p className="text-muted-foreground">
                                Professional-grade results. Download and share
                                your cartoonified photos anywhere.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Styles Showcase */}
                <section className="container mx-auto px-4 py-16">
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                            Choose Your Style
                        </h2>
                        <p className="mb-12 text-lg text-muted-foreground">
                            Transform your photos into any of these iconic
                            cartoon styles
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {styles.map((style) => (
                                <div
                                    key={style}
                                    className="rounded-full border bg-card px-6 py-3 font-medium transition-colors hover:bg-accent"
                                >
                                    {style}
                                </div>
                            ))}
                            <div className="rounded-full border bg-card px-6 py-3 font-medium text-muted-foreground">
                                + 4 more
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="container mx-auto px-4 py-16">
                    <div className="mx-auto max-w-3xl rounded-2xl border bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 p-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                            Ready to Get Started?
                        </h2>
                        <p className="mb-8 text-lg text-muted-foreground">
                            Join and start transforming your photos into amazing
                            cartoons
                        </p>
                        {auth.user ? (
                            <Button size="lg" asChild>
                                <Link href={dashboard()}>
                                    <Sparkles className="mr-2 size-5" />
                                    Go to Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <Button size="lg" asChild>
                                <Link href={register()}>
                                    <Sparkles className="mr-2 size-5" />
                                    Sign Up Free
                                </Link>
                            </Button>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="container mx-auto border-t px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>&copy; 2025 Cartoonio. All rights reserved.</p>
                </footer>
            </div>
        </>
    );
}
