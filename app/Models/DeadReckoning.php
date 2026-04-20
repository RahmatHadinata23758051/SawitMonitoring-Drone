<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeadReckoning extends Model
{
    protected $guarded = ['id'];

    public function drone_dataset()
    {
        return $this->belongsTo(DroneDataset::class, 'drone_dataset_id');
    }
}
