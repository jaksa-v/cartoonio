<?php

use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\CartoonifyController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware('guest')->group(function () {
    Route::get('auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])->name('auth.social.redirect');
    Route::get('auth/{provider}/callback', [SocialAuthController::class, 'callback'])->name('auth.social.callback');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('cartoonify', CartoonifyController::class)
        ->only(['index', 'store', 'show', 'destroy'])
        ->parameters(['cartoonify' => 'generation']);
    Route::post('cartoonify/{generation}/regenerate', [CartoonifyController::class, 'regenerate'])->name('cartoonify.regenerate');
    Route::get('cartoonify/{generation}/file/{type}', [CartoonifyController::class, 'serveFile'])->name('cartoonify.file');
});

require __DIR__.'/settings.php';
