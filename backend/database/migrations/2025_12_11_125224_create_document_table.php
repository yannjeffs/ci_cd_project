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
       Schema::create('documents', function (Blueprint $table) {
        $table->id('id_document');
        $table->string('type_document');
        $table->string('fichier_path');              
        $table->date('date_televersement');
        $table->string('statut')->default('EN_ATTENTE'); // EN_ATTENTE, VALIDE, REJETE

        // FK vers etudiants
        $table->foreignId('etudiant_id')->constrained('etudiants')->onDelete('cascade');

        // FK vers departements
        $table->foreignId('departement_id')->constrained('departements')->onDelete('cascade');

        $table->timestamps();
    });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
