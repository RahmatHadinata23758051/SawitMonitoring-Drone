<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * ============================================================
 * JADWAL OTOMATIS FETCH CUACA DARI OPENWEATHERMAP
 * ============================================================
 * Zona waktu: Asia/Jakarta (WIB, UTC+7)
 * Jadwal  : 4x sehari
 *   - Pagi   : 06:00 WIB
 *   - Siang  : 12:00 WIB
 *   - Sore   : 17:00 WIB
 *   - Malam  : 21:00 WIB
 *
 * Untuk mengaktifkan, pastikan cron job berjalan di server:
 *   * * * * * php /path/to/artisan schedule:run >> /dev/null 2>&1
 *
 * Di development (Windows), jalankan:
 *   php artisan schedule:work
 * ============================================================
 */
Schedule::command('fetch:openweather')
    ->timezone('Asia/Jakarta')
    ->dailyAt('06:00')
    ->name('cuaca-pagi')
    ->withoutOverlapping()
    ->onFailure(function () {
        \Illuminate\Support\Facades\Log::error('[Scheduler] Fetch cuaca PAGI gagal.');
    });

Schedule::command('fetch:openweather')
    ->timezone('Asia/Jakarta')
    ->dailyAt('12:00')
    ->name('cuaca-siang')
    ->withoutOverlapping()
    ->onFailure(function () {
        \Illuminate\Support\Facades\Log::error('[Scheduler] Fetch cuaca SIANG gagal.');
    });

Schedule::command('fetch:openweather')
    ->timezone('Asia/Jakarta')
    ->dailyAt('17:00')
    ->name('cuaca-sore')
    ->withoutOverlapping()
    ->onFailure(function () {
        \Illuminate\Support\Facades\Log::error('[Scheduler] Fetch cuaca SORE gagal.');
    });

Schedule::command('fetch:openweather')
    ->timezone('Asia/Jakarta')
    ->dailyAt('21:00')
    ->name('cuaca-malam')
    ->withoutOverlapping()
    ->onFailure(function () {
        \Illuminate\Support\Facades\Log::error('[Scheduler] Fetch cuaca MALAM gagal.');
    });
