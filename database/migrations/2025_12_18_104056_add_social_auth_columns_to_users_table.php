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
        Schema::table('users', function (Blueprint $table) {
            $table->string('provider')->nullable()->after('email');
            $table->string('provider_id')->nullable()->after('provider');
            $table->string('provider_token', 500)->nullable()->after('provider_id');
            $table->string('provider_refresh_token', 500)->nullable()->after('provider_token');
            $table->string('avatar')->nullable()->after('provider_refresh_token');
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['provider', 'provider_id', 'provider_token', 'provider_refresh_token', 'avatar']);
            $table->string('password')->nullable(false)->change();
        });
    }
};
