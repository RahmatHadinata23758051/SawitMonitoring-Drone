<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DroneDatasetSeeder extends Seeder
{
    public function run(): void
    {
        // Hapus data lama agar tidak duplikat
        DB::table('drone_datasets')->truncate();

        $data = [
            [
                'kode'  => 'DRN001',
                'label' => 'belok kanan',
                'lat'   => -6.9675700,
                'lon'   => 107.6590900,
                'alt'   => 2.0,
                'ax'    => 0.25,
                'ay'    => 1.20,
                'az'    => 9.65,
                'gx'    => 1.50,
                'gy'    => 0.05,
                'gz'    => 2.00,
            ],
            [
                'kode'  => 'DRN002',
                'label' => 'belok kiri',
                'lat'   => -6.9675700,
                'lon'   => 107.6590700,
                'alt'   => 2.1,
                'ax'    => 0.25,
                'ay'    => -1.20,
                'az'    => 9.65,
                'gx'    => -1.50,
                'gy'    => 0.03,
                'gz'    => -2.00,
            ],
            [
                'kode'  => 'DRN003',
                'label' => 'diam (darat)',
                'lat'   => -6.9675926,
                'lon'   => 107.6590826,
                'alt'   => 0.2,
                'ax'    => 0.02,
                'ay'    => -0.01,
                'az'    => 9.81,
                'gx'    => 0.01,
                'gy'    => -0.02,
                'gz'    => 0.00,
            ],
            [
                'kode'  => 'DRN004',
                'label' => 'diam (terbang)',
                'lat'   => -6.9675926,
                'lon'   => 107.6590826,
                'alt'   => 2.0,
                'ax'    => 0.05,
                'ay'    => 0.03,
                'az'    => 9.80,
                'gx'    => 0.03,
                'gy'    => 0.01,
                'gz'    => -0.02,
            ],
            [
                'kode'  => 'DRN005',
                'label' => 'maju',
                'lat'   => -6.9675800,
                'lon'   => 107.6590826,
                'alt'   => 2.2,
                'ax'    => 1.50,
                'ay'    => 0.02,
                'az'    => 9.65,
                'gx'    => 0.05,
                'gy'    => 0.80,
                'gz'    => -0.01,
            ],
            [
                'kode'  => 'DRN006',
                'label' => 'mendarat',
                'lat'   => -6.9675750,
                'lon'   => 107.6590850,
                'alt'   => 1.2,
                'ax'    => -0.05,
                'ay'    => 0.04,
                'az'    => 8.90,
                'gx'    => 0.02,
                'gy'    => -0.03,
                'gz'    => 0.01,
            ],
            [
                'kode'  => 'DRN007',
                'label' => 'mundur',
                'lat'   => -6.9675900,
                'lon'   => 107.6590826,
                'alt'   => 1.8,
                'ax'    => -1.50,
                'ay'    => -0.03,
                'az'    => 9.65,
                'gx'    => -0.02,
                'gy'    => -0.80,
                'gz'    => 0.04,
            ],
            [
                'kode'  => 'DRN008',
                'label' => 'naik',
                'lat'   => -6.9675926,
                'lon'   => 107.6590826,
                'alt'   => 2.5,
                'ax'    => 0.07,
                'ay'    => 0.01,
                'az'    => 10.50,
                'gx'    => 0.04,
                'gy'    => 0.02,
                'gz'    => -0.03,
            ],
            [
                'kode'  => 'DRN009',
                'label' => 'pitch atas',
                'lat'   => -6.9675900,
                'lon'   => 107.6590800,
                'alt'   => 2.2,
                'ax'    => -1.80,
                'ay'    => 0.05,
                'az'    => 9.60,
                'gx'    => 0.01,
                'gy'    => -2.50,
                'gz'    => 0.02,
            ],
            [
                'kode'  => 'DRN010',
                'label' => 'pitch bawah',
                'lat'   => -6.9675850,
                'lon'   => 107.6590850,
                'alt'   => 1.8,
                'ax'    => 1.80,
                'ay'    => -0.05,
                'az'    => 9.60,
                'gx'    => -0.02,
                'gy'    => 2.50,
                'gz'    => -0.01,
            ],
            [
                'kode'  => 'DRN011',
                'label' => 'roll kanan',
                'lat'   => -6.9675926,
                'lon'   => 107.6590950,
                'alt'   => 2.1,
                'ax'    => 0.05,
                'ay'    => 1.80,
                'az'    => 9.60,
                'gx'    => 2.50,
                'gy'    => 0.03,
                'gz'    => 0.05,
            ],
            [
                'kode'  => 'DRN012',
                'label' => 'roll kiri',
                'lat'   => -6.9675926,
                'lon'   => 107.6590700,
                'alt'   => 2.1,
                'ax'    => -0.05,
                'ay'    => -1.80,
                'az'    => 9.60,
                'gx'    => -2.50,
                'gy'    => -0.02,
                'gz'    => -0.05,
            ],
            [
                'kode'  => 'DRN013',
                'label' => 'rotasi kanan',
                'lat'   => -6.9675800,
                'lon'   => 107.6590800,
                'alt'   => 2.0,
                'ax'    => 0.02,
                'ay'    => 0.02,
                'az'    => 9.81,
                'gx'    => 0.01,
                'gy'    => 0.02,
                'gz'    => 2.80,
            ],
            [
                'kode'  => 'DRN014',
                'label' => 'rotasi kiri',
                'lat'   => -6.9675800,
                'lon'   => 107.6590800,
                'alt'   => 2.0,
                'ax'    => -0.02,
                'ay'    => -0.02,
                'az'    => 9.81,
                'gx'    => -0.02,
                'gy'    => -0.01,
                'gz'    => -2.80,
            ],
        ];

        // Tambahkan timestamps
        $now = now();
        foreach ($data as &$row) {
            $row['created_at'] = $now;
            $row['updated_at'] = $now;
        }

        DB::table('drone_datasets')->insert($data);

        $this->command->info('✅ DroneDataset: ' . count($data) . ' data IMU berhasil diinsert.');
    }
}
