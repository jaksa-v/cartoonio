<?php

use App\Http\Controllers\CartoonifyController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('cartoonify', [CartoonifyController::class, 'index'])->name('cartoonify.index');
    Route::post('cartoonify', [CartoonifyController::class, 'store'])->name('cartoonify.store');
    Route::post('cartoonify/{generation}/regenerate', [CartoonifyController::class, 'regenerate'])->name('cartoonify.regenerate');
});

require __DIR__.'/settings.php';
