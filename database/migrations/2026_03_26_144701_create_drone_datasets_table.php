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
        Schema::create('drone_datasets', function (Blueprint $table) {
            $table->id();
            $table->string('kode_kondisi')->unique();
            $table->string('nama_kondisi');
            $table->float('accel_x');
            $table->float('accel_y');
            $table->float('accel_z');
            $table->float('gyro_x');
            $table->float('gyro_y');
            $table->float('gyro_z');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drone_datasets');
    }
};
