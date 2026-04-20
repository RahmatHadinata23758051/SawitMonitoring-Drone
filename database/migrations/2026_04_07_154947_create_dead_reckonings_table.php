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
        Schema::create('dead_reckonings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drone_dataset_id')->constrained('drone_datasets')->cascadeOnDelete();
            $table->double('durasi')->nullable();
            $table->enum('satuan_waktu', ['menit', 'detik', 'milidetik'])->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dead_reckonings');
    }
};
