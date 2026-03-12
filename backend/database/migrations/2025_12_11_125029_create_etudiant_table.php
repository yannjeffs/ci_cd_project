<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
  Schema::create('etudiants', function (Blueprint $table) {
    $table->id();
    $table->string('matricule')->unique();
    $table->string('sexe', 1); // M ou F
    $table->string('adresse');
    $table->date('date_naissance');
    $table->date('date_inscription');

    // Relations indispensables
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('niveau_id')->constrained('niveaux');
    $table->foreignId('filiere_id')->constrained('filieres');

    $table->timestamps();
});

    }

    public function down(): void
    {
        Schema::dropIfExists('etudiants'); // ✅ corrigé
    }
};
