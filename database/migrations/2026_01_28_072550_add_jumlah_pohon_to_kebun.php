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
        Schema::table('kebuns', function (Blueprint $table) {
            $table->integer('jumlah_pohon')->nullable();
            $table->integer('jumlah_pohon_matang')->nullable();
            $table->integer('jumlah_pohon_belum_matang')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kebun', function (Blueprint $table) {
            $table->dropColumn('jumlah_pohon');
            $table->dropColumn('jumlah_pohon_matang');
            $table->dropColumn('jumlah_pohon_belum_matang');
        });
    }
};
