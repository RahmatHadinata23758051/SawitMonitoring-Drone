<?php

use App\Http\Controllers\LaporanController;
use App\Http\Controllers\PengaturanAplikasiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/pengaturan-aplikasi', [PengaturanAplikasiController::class, 'fetchPengaturanAplikasi'])->name('fetch.pengaturan-aplikasi');
Route::post('/predict', [LaporanController::class, 'sendSample'])->name('predict.sample');
