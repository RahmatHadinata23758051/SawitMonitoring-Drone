<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lahan extends Model
{
    protected $guarded = ['id'];

    public function kebun(): HasMany
    {
        return $this->hasMany(Kebun::class, 'lahan_id', 'id');
    }
}
