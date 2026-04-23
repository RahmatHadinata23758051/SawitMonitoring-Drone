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
        Schema::create('flight_log_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flight_log_id')->constrained()->cascadeOnDelete();
            $table->string('timestamp')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lon', 10, 7)->nullable();
            $table->decimal('alt', 8, 2)->nullable();
            $table->decimal('ax', 8, 3)->nullable();
            $table->decimal('ay', 8, 3)->nullable();
            $table->decimal('az', 8, 3)->nullable();
            $table->decimal('gx', 8, 3)->nullable();
            $table->decimal('gy', 8, 3)->nullable();
            $table->decimal('gz', 8, 3)->nullable();
            $table->string('mode')->nullable();
            $table->string('sub_state')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flight_log_details');
    }
};
