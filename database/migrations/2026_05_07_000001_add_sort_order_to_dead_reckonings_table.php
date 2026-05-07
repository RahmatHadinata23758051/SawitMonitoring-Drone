<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\DeadReckoning;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dead_reckonings', function (Blueprint $table) {
            $table->unsignedInteger('sort_order')->default(0)->after('satuan_waktu');
        });

        // Set sort_order berdasarkan id yang sudah ada
        DeadReckoning::orderBy('id')->each(function ($rule, $index) {
            $rule->update(['sort_order' => $index + 1]);
        });
    }

    public function down(): void
    {
        Schema::table('dead_reckonings', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }
};
