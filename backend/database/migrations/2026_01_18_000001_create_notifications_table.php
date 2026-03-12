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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            
            // Référence vers l'utilisateur (étudiant)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Type de notification
            $table->string('type'); // DOCUMENTS_VALIDES, DOCUMENT_VALIDE, DOCUMENT_REJETE, PAIEMENT_VALIDE, etc.
            
            // Contenu de la notification
            $table->string('titre');
            $table->text('message');
            
            // Statut de lecture
            $table->boolean('lu')->default(false);
            
            // Données supplémentaires (JSON)
            $table->json('data')->nullable();
            
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['user_id', 'lu']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
