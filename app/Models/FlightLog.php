<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlightLog extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'config_data' => 'array',
        'battery_used' => 'float',
        'accuracy' => 'float',
    ];

    /**
     * Relasi ke Mission (nullable — log bisa dibuat walau misi belum disimpan)
     */
    public function mission()
    {
        return $this->belongsTo(Mission::class, 'mission_id');
    }

    /**
     * Relasi ke Perangkat (drone yang digunakan)
     */
    public function perangkat()
    {
        return $this->belongsTo(Perangkat::class, 'perangkat_id');
    }

    /**
     * Format waktu terbang (seconds → m:ss)
     */
    public function getFlightTimeLabelAttribute(): string
    {
        $s = $this->flight_time_seconds;
        return floor($s / 60) . 'm ' . ($s % 60) . 's';
    }
    public function details()
    {
        return $this->hasMany(FlightLogDetail::class);
    }
}
