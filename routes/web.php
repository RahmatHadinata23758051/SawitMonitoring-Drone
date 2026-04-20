<?php

use App\Http\Controllers\CuacaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeadReckoningController;
use App\Http\Controllers\DroneDatasetController;
use App\Http\Controllers\GCSController;
use App\Http\Controllers\KebunController;
use App\Http\Controllers\KebunDatasetController;
use App\Http\Controllers\LahanController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\LogAktivitasController;
use App\Http\Controllers\MissionController;
use App\Http\Controllers\PanenController;
use App\Http\Controllers\PengaturanAplikasiController;
use App\Http\Controllers\PerangkatController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SawitDatasetController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('lahan', LahanController::class);
    Route::resource('kebun', KebunController::class);
    Route::resource('perangkat', PerangkatController::class);
    Route::resource('user', UserController::class)->except('show');
    Route::resource('panen', PanenController::class);

    Route::get('/cuaca', [CuacaController::class, 'index'])->name('cuaca.index');
    Route::post('/cuaca', [CuacaController::class, 'store'])->name('cuaca.store');
    Route::post('/cuaca/kota', [CuacaController::class, 'getCities'])->name('cuaca.kota');
    Route::post('/cuaca/kecamatan', [CuacaController::class, 'getDistricts'])->name('cuaca.kecamatan');
    Route::post('/cuaca/desa', [CuacaController::class, 'getVillages'])->name('cuaca.desa');
    Route::get('/gcs', [GCSController::class, 'index'])->name('gcs.index');
    Route::post('/drone/control', [GCSController::class, 'control'])->name('drone.control');
    Route::resource('dataset/drone', DroneDatasetController::class)->except('show')->names([
        'index' => 'drone-dataset.index',
        'create' => 'drone-dataset.create',
        'store' => 'drone-dataset.store',
        'edit' => 'drone-dataset.edit',
        'update' => 'drone-dataset.update',
        'destroy' => 'drone-dataset.destroy',
    ])->parameters(['drone' => 'droneDataset']);
    Route::resource('dataset/sawit', SawitDatasetController::class)->except('show')->names([
        'index' => 'sawit-dataset.index',
        'create' => 'sawit-dataset.create',
        'store' => 'sawit-dataset.store',
        'edit' => 'sawit-dataset.edit',
        'update' => 'sawit-dataset.update',
        'destroy' => 'sawit-dataset.destroy',
    ])->parameters(['sawit' => 'sawitDataset']);
    Route::resource('dataset/kebun', KebunDatasetController::class)->except('show')->names([
        'index' => 'kebun-dataset.index',
        'create' => 'kebun-dataset.create',
        'store' => 'kebun-dataset.store',
        'edit' => 'kebun-dataset.edit',
        'update' => 'kebun-dataset.update',
        'destroy' => 'kebun-dataset.destroy',
    ])->parameters(['kebun' => 'kebunDataset']);
    Route::resource('rule-engine/dead-reckoning', DeadReckoningController::class)->except('show');
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
    Route::get('/laporan/log-penerbangan', [MissionController::class, 'logPenerbangan'])->name('laporan.log-penerbangan');

    Route::get('/pengaturan-aplikasi', [PengaturanAplikasiController::class, 'index'])->name('pengaturan-aplikasi.index');
    Route::post('/pengaturan-aplikasi', [PengaturanAplikasiController::class, 'store'])->name('pengaturan-aplikasi.store');
    Route::get('/log-aktivitas', [LogAktivitasController::class, 'index'])->name('log-aktivitas');

    Route::get('/missions', [MissionController::class, 'index']);
    Route::post('/missions', [MissionController::class, 'store']);
    Route::get('/missions/{id}', [MissionController::class, 'show']);

    // === API JSON untuk GCS React ===
    Route::get('/api/pengaturan-aplikasi', [PengaturanAplikasiController::class, 'fetchPengaturanAplikasi']);
    Route::get('/api/perangkat', [PerangkatController::class, 'apiIndex']);
    Route::get('/api/kebun', [KebunController::class, 'apiIndex']);
});

require __DIR__ . '/auth.php';
