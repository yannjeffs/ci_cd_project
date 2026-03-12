<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('enrollements', function (Blueprint $table) {
            $table->id();
            $table->date('date_enrolement');
            $table->string('fiche_pdf_path')->nullable();
            $table->string('statut')->default('EN_ATTENTE');

            $table->foreignId('etudiant_id')->constrained('etudiants')->onDelete('cascade');
            // Ajout d'une clé vers qr_tokens si tu l'utilises
            $table->foreignId('qr_token_id')->nullable()->constrained('qr_tokens');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollements');
    }
};
