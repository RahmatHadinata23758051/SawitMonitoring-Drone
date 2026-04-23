<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlightLogDetail extends Model
{
    protected $fillable = [
        'flight_log_id', 'timestamp', 'lat', 'lon', 'alt',
        'ax', 'ay', 'az', 'gx', 'gy', 'gz', 'mode', 'sub_state'
    ];

    public function flightLog()
    {
        return $this->belongsTo(FlightLog::class);
    }
}
