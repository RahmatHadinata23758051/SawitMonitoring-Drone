<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cuaca extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'last_fetched_at' => 'datetime',
    ];

    /**
     * Jadwal fetch 4x sehari (WIB = UTC+7):
     * 06:00, 12:00, 17:00, 21:00 WIB
     */
    public const FETCH_SCHEDULES = [
        ['label' => 'Pagi',  'time' => '06:00', 'utc' => '23:00'], // UTC dari hari sebelumnya
        ['label' => 'Siang', 'time' => '12:00', 'utc' => '05:00'],
        ['label' => 'Sore',  'time' => '17:00', 'utc' => '10:00'],
        ['label' => 'Malam', 'time' => '21:00', 'utc' => '14:00'],
    ];

    /**
     * Hitung sesi fetch berikutnya dalam WIB.
     */
    public function getNextFetchLabel(): string
    {
        $nowWib   = now()->setTimezone('Asia/Jakarta');
        $nowHour  = (int) $nowWib->format('H');
        $nowMin   = (int) $nowWib->format('i');
        $nowTotal = $nowHour * 60 + $nowMin;

        $slots = [
            ['label' => 'Pagi',  'minutes' =>  6 * 60],
            ['label' => 'Siang', 'minutes' => 12 * 60],
            ['label' => 'Sore',  'minutes' => 17 * 60],
            ['label' => 'Malam', 'minutes' => 21 * 60],
        ];

        foreach ($slots as $slot) {
            if ($nowTotal < $slot['minutes']) {
                return "Jadwal berikutnya: {$slot['label']} ({$slot['label']} jam " . gmdate('H:i', $slot['minutes'] * 60) . " WIB)";
            }
        }

        return 'Jadwal berikutnya: Pagi (06:00 WIB besok)';
    }
}
