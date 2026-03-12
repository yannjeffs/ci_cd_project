<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concours', function (Blueprint $table) {
            $table->id();
            $table->string('nom'); // Ex: "ENSPY - École Nationale Supérieure Polytechnique de Yaoundé"
            $table->string('code')->unique(); // Ex: "ENSPY", "ENSPT", "FGI"
            $table->text('description')->nullable();
            $table->date('date_debut_inscription'); // Début des inscriptions
            $table->date('date_fin_inscription'); // Fin des inscriptions
            $table->date('date_concours'); // Date du concours
            $table->decimal('frais_inscription', 10, 2)->default(0); // Frais d'inscription
            $table->string('statut')->default('OUVERT'); // OUVERT, FERME, TERMINE
            $table->string('ville')->nullable(); // Ville principale
            $table->text('conditions')->nullable(); // Conditions d'admission
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concours');
    }
};
