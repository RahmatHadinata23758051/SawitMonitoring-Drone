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
        Schema::create('flight_logs', function (Blueprint $table) {
            $table->id();
            $table->string('log_code')->unique();
            $table->foreignId('mission_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('perangkat_id')->nullable()->constrained('perangkats')->nullOnDelete();
            $table->string('mission_name');
            $table->enum('nav_algorithm', ['dead_reckoning', 'live_reckoning', 'hybrid']);
            $table->enum('scan_mode', ['traditional', 'qlv']);
            $table->integer('flight_time_seconds')->default(0);
            $table->decimal('battery_used', 5, 2)->default(0);
            $table->enum('status', ['active', 'completed', 'aborted'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flight_logs');
    }
};
