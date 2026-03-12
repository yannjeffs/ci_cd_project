<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Cette migration ajoute le support pour les inscriptions multiples aux concours.
     * Un étudiant peut maintenant s'inscrire à plusieurs concours différents.
     */
    public function up(): void
    {
        // ÉTAPE 1 : Ajouter les nouvelles colonnes (nullable pour la migration)
        
        Schema::table('enrollements', function (Blueprint $table) {
            $table->foreignId('concours_id')->nullable()->after('etudiant_id')->constrained('concours')->onDelete('cascade');
            $table->foreignId('departement_id')->nullable()->after('concours_id')->constrained('departements')->onDelete('cascade');
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->foreignId('concours_id')->nullable()->after('etudiant_id')->constrained('concours')->onDelete('cascade');
        });

        Schema::table('paiements', function (Blueprint $table) {
            $table->foreignId('concours_id')->nullable()->after('etudiant_id')->constrained('concours')->onDelete('cascade');
        });

        // ÉTAPE 2 : Migrer les données existantes
        
        // Migrer enrollements : copier concours_id et departement_id depuis etudiants
        DB::statement('
            UPDATE enrollements e
            INNER JOIN etudiants et ON e.etudiant_id = et.id
            SET e.concours_id = et.concours_id,
                e.departement_id = et.departement_id
            WHERE e.concours_id IS NULL
        ');

        // Migrer documents : copier concours_id depuis etudiants
        DB::statement('
            UPDATE documents d
            INNER JOIN etudiants et ON d.etudiant_id = et.id
            SET d.concours_id = et.concours_id
            WHERE d.concours_id IS NULL
        ');

        // Migrer paiements : copier concours_id depuis etudiants
        DB::statement('
            UPDATE paiements p
            INNER JOIN etudiants et ON p.etudiant_id = et.id
            SET p.concours_id = et.concours_id
            WHERE p.concours_id IS NULL
        ');

        // ÉTAPE 3 : Rendre les colonnes NOT NULL et ajouter les contraintes

        
        Schema::table('enrollements', function (Blueprint $table) {
            // Rendre NOT NULL
            $table->unsignedBigInteger('concours_id')->nullable(false)->change();
            $table->unsignedBigInteger('departement_id')->nullable(false)->change();
            
            // Ajouter contrainte unique pour empêcher les doublons
            $table->unique(['etudiant_id', 'concours_id'], 'unique_etudiant_concours');
            
            // Ajouter index pour les performances
            $table->index(['etudiant_id', 'concours_id'], 'idx_etudiant_concours');
        });

        Schema::table('documents', function (Blueprint $table) {
            // Garder nullable pour permettre des documents sans concours (si nécessaire)
            // Mais ajouter un index pour les performances
            $table->index(['etudiant_id', 'concours_id'], 'idx_documents_etudiant_concours');
        });

        Schema::table('paiements', function (Blueprint $table) {
            // Garder nullable pour permettre des paiements sans concours (si nécessaire)
            // Mais ajouter un index pour les performances
            $table->index(['etudiant_id', 'concours_id'], 'idx_paiements_etudiant_concours');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Supprimer les contraintes et index d'abord
        Schema::table('enrollements', function (Blueprint $table) {
            $table->dropUnique('unique_etudiant_concours');
            $table->dropIndex('idx_etudiant_concours');
            $table->dropForeign(['concours_id']);
            $table->dropForeign(['departement_id']);
            $table->dropColumn(['concours_id', 'departement_id']);
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->dropIndex('idx_documents_etudiant_concours');
            $table->dropForeign(['concours_id']);
            $table->dropColumn('concours_id');
        });

        Schema::table('paiements', function (Blueprint $table) {
            $table->dropIndex('idx_paiements_etudiant_concours');
            $table->dropForeign(['concours_id']);
            $table->dropColumn('concours_id');
        });
    }
};
