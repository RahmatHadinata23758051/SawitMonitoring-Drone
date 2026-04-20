<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaporanPrediksi extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'raw_response' => 'object',
    ];

    protected static function booted()
    {
        static::created(function ($model) {
            $model->sampel_ke = $model->id;
            $model->save();
        });
    }
}
