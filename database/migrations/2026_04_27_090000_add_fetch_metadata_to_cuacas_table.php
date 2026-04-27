<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cuacas', function (Blueprint $table) {
            $table->timestamp('last_fetched_at')->nullable()->after('description');
            $table->string('fetch_status')->nullable()->after('last_fetched_at'); // 'success' | 'failed'
            $table->string('next_fetch_schedule')->nullable()->after('fetch_status');
        });
    }

    public function down(): void
    {
        Schema::table('cuacas', function (Blueprint $table) {
            $table->dropColumn(['last_fetched_at', 'fetch_status', 'next_fetch_schedule']);
        });
    }
};
