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
        Schema::table('drone_datasets', function (Blueprint $table) {
            $table->renameColumn('kode_kondisi', 'kode');
            $table->renameColumn('nama_kondisi', 'label');
            $table->renameColumn('accel_x', 'ax');
            $table->renameColumn('accel_y', 'ay');
            $table->renameColumn('accel_z', 'az');
            $table->renameColumn('gyro_x', 'gx');
            $table->renameColumn('gyro_y', 'gy');
            $table->renameColumn('gyro_z', 'gz');
        });

        Schema::table('drone_datasets', function (Blueprint $table) {
            $table->double('lat')->nullable();
            $table->double('lon')->nullable();
            $table->double('alt')->nullable();
            $table->double('vx')->nullable();
            $table->double('vy')->nullable();
            $table->double('vz')->nullable();
            $table->double('dist_front')->nullable();
            $table->double('dist_left')->nullable();
            $table->double('dist_right')->nullable();
            $table->double('dist_back')->nullable();
            $table->string('obstacle_status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drone_datasets', function (Blueprint $table) {
            $table->dropColumn([
                'lat',
                'lon',
                'alt',
                'vx',
                'vy',
                'vz',
                'dist_front',
                'dist_left',
                'dist_right',
                'dist_back',
                'obstacle_status',
            ]);
        });

        Schema::table('drone_datasets', function (Blueprint $table) {
            $table->renameColumn('kode', 'kode_kondisi');
            $table->renameColumn('label', 'nama_kondisi');
            $table->renameColumn('ax', 'accel_x');
            $table->renameColumn('ay', 'accel_y');
            $table->renameColumn('az', 'accel_z');
            $table->renameColumn('gx', 'gyro_x');
            $table->renameColumn('gy', 'gyro_y');
            $table->renameColumn('gz', 'gyro_z');
        });
    }
};
