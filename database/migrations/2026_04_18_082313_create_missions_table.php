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
        Schema::create('missions', function (Blueprint $table) {
            $table->id();
            $table->string('mission_name');
            $table->foreignId('perangkat_id')->nullable()->constrained('perangkats')->nullOnDelete();
            $table->enum('nav_algorithm', ['dead_reckoning', 'live_reckoning', 'hybrid'])->default('dead_reckoning');
            $table->enum('scan_mode', ['traditional', 'qlv'])->default('traditional');
            $table->json('waypoints')->nullable();
            $table->json('path_data')->nullable();
            $table->enum('status', ['Draft', 'Saved', 'Uploaded', 'Completed'])->default('Draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('missions');
    }
};
