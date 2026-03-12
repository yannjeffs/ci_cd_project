<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('centre_examens', function (Blueprint $table) {
            // clé primaire personnalisée
            $table->id('id_centre_examen');

            // colonnes
            $table->string('nom');
            $table->string('code');
            $table->integer('capacite'); // capacité = nombre de places
            $table->string('statut');
            $table->string('adresse');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('centre_examens');
    }
};
