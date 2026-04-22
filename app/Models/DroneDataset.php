<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DroneDataset extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'lat' => 'float',
        'lon' => 'float',
        'alt' => 'float',
        'ax' => 'float',
        'ay' => 'float',
        'az' => 'float',
        'gx' => 'float',
        'gy' => 'float',
        'gz' => 'float',
        'vx' => 'float',
        'vy' => 'float',
        'vz' => 'float',
        'dist_front' => 'float',
        'dist_left' => 'float',
        'dist_right' => 'float',
        'dist_back' => 'float',
    ];

    public function dead_reckoning()
    {
        return $this->hasMany(DeadReckoning::class, 'drone_dataset_id');
    }
}
