<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kebun extends Model
{
    protected $guarded = ['id'];

    public function lahan(): BelongsTo
    {
        return $this->belongsTo(Lahan::class, 'lahan_id', 'id');
    }

    public function panen(): HasMany
    {
        return $this->hasMany(Panen::class, 'kebun_id', 'id');
    }

    public function kebun_dataset()
    {
        return $this->hasMany(KebunDataset::class);
    }
}
