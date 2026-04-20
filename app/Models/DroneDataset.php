<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DroneDataset extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'accel_x'     => 'float',
        'accel_y'     => 'float',
        'accel_z'     => 'float',
        'gyro_x'      => 'float',
        'gyro_y'      => 'float',
        'gyro_z'      => 'float',
    ];

    public function dead_reckoning()
    {
        return $this->hasMany(DeadReckoning::class, 'drone_dataset_id');
    }
}
