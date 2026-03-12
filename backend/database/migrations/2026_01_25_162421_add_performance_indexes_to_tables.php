<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Ajoute des index pour optimiser les performances des requêtes fréquentes
     */
    public function up(): void
    {
        // Index pour la table documents
        Schema::table('documents', function (Blueprint $table) {
            // Index composite pour les requêtes filtrées par étudiant, concours et statut
            $table->index(['etudiant_id', 'concours_id', 'statut'], 'idx_documents_etudiant_concours_statut');
            
            // Index pour les requêtes filtrées par concours uniquement
            $table->index('concours_id', 'idx_documents_concours');
        });

        // Index pour la table paiements
        Schema::table('paiements', function (Blueprint $table) {
            // Index composite pour les requêtes filtrées par étudiant, concours et statut
            $table->index(['etudiant_id', 'concours_id', 'statut'], 'idx_paiements_etudiant_concours_statut');
            
            // Index pour les requêtes filtrées par concours uniquement
            $table->index('concours_id', 'idx_paiements_concours');
        });

        // Index pour la table enrollements
        Schema::table('enrollements', function (Blueprint $table) {
            // Index composite pour les requêtes filtrées par étudiant et concours
            $table->index(['etudiant_id', 'concours_id'], 'idx_enrollements_etudiant_concours');
            
            // Index pour les requêtes filtrées par concours uniquement
            $table->index('concours_id', 'idx_enrollements_concours');
            
            // Index pour les requêtes filtrées par statut
            $table->index('statut', 'idx_enrollements_statut');
        });

        // Index pour la table notifications
        Schema::table('notifications', function (Blueprint $table) {
            // Index composite pour les requêtes filtrées par utilisateur et statut de lecture
            $table->index(['user_id', 'lue'], 'idx_notifications_user_lue');
            
            // Index pour les requêtes triées par date
            $table->index('created_at', 'idx_notifications_created_at');
        });

        // Index pour la table etudiants
        Schema::table('etudiants', function (Blueprint $table) {
            // Index pour les requêtes filtrées par département
            $table->index('departement_id', 'idx_etudiants_departement');
            
            // Index pour les requêtes filtrées par filière
            $table->index('filiere_id', 'idx_etudiants_filiere');
            
            // Index pour les requêtes filtrées par concours
            $table->index('concours_id', 'idx_etudiants_concours');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Supprimer les index de la table documents
        Schema::table('documents', function (Blueprint $table) {
            $table->dropIndex('idx_documents_etudiant_concours_statut');
            $table->dropIndex('idx_documents_concours');
        });

        // Supprimer les index de la table paiements
        Schema::table('paiements', function (Blueprint $table) {
            $table->dropIndex('idx_paiements_etudiant_concours_statut');
            $table->dropIndex('idx_paiements_concours');
        });

        // Supprimer les index de la table enrollements
        Schema::table('enrollements', function (Blueprint $table) {
            $table->dropIndex('idx_enrollements_etudiant_concours');
            $table->dropIndex('idx_enrollements_concours');
            $table->dropIndex('idx_enrollements_statut');
        });

        // Supprimer les index de la table notifications
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notifications_user_lue');
            $table->dropIndex('idx_notifications_created_at');
        });

        // Supprimer les index de la table etudiants
        Schema::table('etudiants', function (Blueprint $table) {
            $table->dropIndex('idx_etudiants_departement');
            $table->dropIndex('idx_etudiants_filiere');
            $table->dropIndex('idx_etudiants_concours');
        });
    }
};
