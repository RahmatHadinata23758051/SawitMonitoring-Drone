<?php

namespace App\Console\Commands;

use App\Models\Cuaca;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Laravolt\Indonesia\Models\City;

class FetchOpenWeather extends Command
{
    protected $signature = 'fetch:openweather';
    protected $description = 'Fetch real-time weather data from OpenWeatherMap API';

    public function handle()
    {
        $cuaca = Cuaca::first();
        if (!$cuaca) {
            Log::warning('[OWM] Lokasi cuaca belum dikonfigurasi.');
            $this->warn('Harap atur lokasi terlebih dahulu di /cuaca.');
            return 1;
        }

        // Ambil nama kota — dari DB atau query model Indonesia
        $cityName = $cuaca->kabupaten_kota;
        if (!$cityName && $cuaca->city_code) {
            $city     = City::where('code', $cuaca->city_code)->first();
            $cityName = $city?->name;
        }

        if (!$cityName) {
            $this->warn('Nama kota tidak ditemukan, simpan ulang lokasi cuaca.');
            return 1;
        }

        return self::fetchAndSave($cuaca, $cityName, $this);
    }

    /**
     * Fetch OWM dan simpan ke record cuaca.
     * Bisa dipanggil dari command MAUPUN controller.
     */
    public static function fetchAndSave(Cuaca $cuaca, string $cityName, $output = null): int
    {
        $apiKey = config('services.openweather.key');

        $response = Http::timeout(10)->get('https://api.openweathermap.org/data/2.5/weather', [
            'q'     => $cityName . ',ID',
            'appid' => $apiKey,
            'units' => 'metric',
            'lang'  => 'id',
        ]);

        if ($response->successful()) {
            $data = $response->json();

            $cuaca->kabupaten_kota = $data['name'] ?? $cityName;
            $cuaca->temperature    = round($data['main']['temp'] ?? 0);
            $cuaca->humidity       = $data['main']['humidity'] ?? '--';
            $cuaca->wind_speed     = round(($data['wind']['speed'] ?? 0) * 3.6, 1); // m/s → km/h
            $cuaca->rainfall       = $data['rain']['1h'] ?? '0';
            $cuaca->description    = ucfirst($data['weather'][0]['description'] ?? '--');
            $cuaca->image          = 'https://openweathermap.org/img/wn/' . ($data['weather'][0]['icon'] ?? '01d') . '@2x.png';
            $cuaca->save();

            $msg = "Cuaca {$cuaca->kabupaten_kota}: {$cuaca->temperature}°C - {$cuaca->description}";
            Log::info("[OWM] ✅ {$msg}");
            $output?->info("✅ {$msg}");
            return 0;
        }

        $code = $response->status();
        $msg  = $response->json('message') ?? 'Unknown error';
        Log::error("[OWM] ❌ Gagal fetch: {$code} - {$msg} (kota: {$cityName})");
        $output?->error("❌ Gagal fetch OWM [{$code}]: {$msg}");
        return 1;
    }
}
