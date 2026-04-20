<?php

namespace App\Console\Commands;

use App\Models\Cuaca;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FetchBmkg extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fetch:bmkg';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // ambil adm4 dari DB (kode desa)
        $cuaca = Cuaca::first();
        if (!$cuaca || !$cuaca->village_code) {
            Log::warning('Pengaturan data cuaca tidak ditemukan!');
            return;
        }

        $adm4 = $this->formatAdm4($cuaca->village_code);

        // hit BMKG API
        $response = Http::get("https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={$adm4}");

        if ($response->successful()) {
            $json = $response->json();
            $desa = $json['lokasi']['desa'];
            $kecamatan = $json['lokasi']['kecamatan'];
            $kotkab = $json['lokasi']['kotkab'];
            $provinsi = $json['lokasi']['provinsi'];

            // pastikan ada data
            if (!empty($json['data'][0]['cuaca'])) {
                $now = Carbon::now('Asia/Jakarta');
                $nearest = null;
                $minDiff = PHP_INT_MAX;

                foreach ($json['data'][0]['cuaca'] as $slot) {
                    foreach ($slot as $forecast) {
                        if (empty($forecast['local_datetime'])) {
                            continue;
                        }

                        $dt = Carbon::parse($forecast['local_datetime'], 'Asia/Jakarta');
                        $diff = abs($now->diffInMinutes($dt));

                        if ($diff < $minDiff) {
                            $minDiff = $diff;
                            $nearest = $forecast;
                        }
                    }
                }

                if ($nearest) {
                    $cuaca->desa = $desa;
                    $cuaca->kecamatan = $kecamatan;
                    $cuaca->kabupaten_kota = $kotkab;
                    $cuaca->provinsi = $provinsi;
                    $cuaca->temperature = $nearest['t'] ?? '--';
                    $cuaca->humidity = $nearest['hu'] ?? '--';
                    $cuaca->wind_speed = $nearest['ws'] ?? '--';
                    $cuaca->rainfall = $nearest['tp'] ?? '--';
                    $cuaca->image = $nearest['image'] ?? null;
                    $cuaca->description = $nearest['weather_desc'] ?? '--';
                    $cuaca->save();
                    Log::info("Data cuaca berhasil diperbarui!");
                }
            }
        }
    }

    // Format kode desa sesuai adm4 BMKG
    private function formatAdm4(string $villageCode): string
    {
        $code = str_pad($villageCode, 10, '0', STR_PAD_LEFT);

        $adm1 = substr($code, 0, 2);
        $adm2 = substr($code, 2, 2);
        $adm3 = substr($code, 4, 2);
        $adm4 = substr($code, 6, 4);

        return "{$adm1}.{$adm2}.{$adm3}.{$adm4}";
    }
}
