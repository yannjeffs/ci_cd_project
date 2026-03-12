<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiements', function (Blueprint $table) {
            // Utilisation de id_paiement comme clé primaire
            $table->id('id_paiement');

            $table->decimal('montant', 10, 2);
            $table->date('date_paiement');
            $table->string('mode_paiement'); // ex: Orange Money, Moov Money, Virement, Espèces
            $table->string('reference_transaction')->nullable(); // Référence de la transaction

            // Statut avec une valeur par défaut cohérente
            $table->string('statut')->default('EN_ATTENTE');

            // Relation avec la table etudiants
            $table->foreignId('etudiant_id')->constrained('etudiants')->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
