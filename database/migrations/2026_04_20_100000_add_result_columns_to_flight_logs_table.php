<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom hasil penerbangan ke flight_logs:
     * samples_count, matang, belum_matang, accuracy, mission_name, nav_algorithm, scan_mode, config_data
     * BL-09 — FlightLogs Persistence
     */
    public function up(): void
    {
        Schema::table('flight_logs', function (Blueprint $table) {
            // Kolom hasil scanning (belum ada di skema awal)
            $table->integer('samples_count')->default(0)->after('battery_used');
            $table->integer('matang')->default(0)->after('samples_count');
            $table->integer('belum_matang')->default(0)->after('matang');
            $table->decimal('accuracy', 5, 2)->default(0)->after('belum_matang');
            $table->json('config_data')->nullable()->after('accuracy');
            // mission_name sudah ada di tabel; nav_algorithm dan scan_mode juga sudah ada
        });
    }

    public function down(): void
    {
        Schema::table('flight_logs', function (Blueprint $table) {
            $table->dropColumn(['samples_count', 'matang', 'belum_matang', 'accuracy', 'config_data']);
        });
    }
};
