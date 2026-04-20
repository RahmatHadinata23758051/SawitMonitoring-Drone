<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kebun_datasets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kebun_id')->constrained('kebuns')->cascadeOnDelete();
            $table->integer('jumlah_pohon');
            $table->integer('tinggi_pohon');
            $table->integer('interval_pohon_sejalur');
            $table->integer('interval_pohon_menyamping');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kebun_datasets');
    }
};
