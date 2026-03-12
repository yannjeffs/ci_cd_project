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
        Schema::create('centre_depots', function (Blueprint $table) {
            $table->id('id_centre_depot');
            $table->string('nom');
            $table->string('code')->unique();
            $table->string('statut')->default('ACTIF');
            $table->string('region');
            $table->string('adresse')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('centre_depots');
    }
};
