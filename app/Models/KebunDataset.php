<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KebunDataset extends Model
{
    protected $guarded = ['id'];

    public function kebun()
    {
        return $this->belongsTo(Kebun::class);
    }
}
