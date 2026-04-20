<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Panen extends Model
{
    protected $guarded = ['id'];
    
    public function kebun(): BelongsTo
    {
        return $this->belongsTo(Kebun::class, 'kebun_id', 'id');
    }
}
