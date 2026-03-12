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
        Schema::table('enrollements', function (Blueprint $table) {
            $table->string('annee_academique')->nullable()->after('statut');
            $table->foreignId('filiere_id')->constrained('filieres');
            $table->foreignId('niveau_id')->constrained('niveaux');
            $table->foreignId('centre_depot_id')->constrained('centre_depots', 'id_centre_depot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollements', function (Blueprint $table) {
            $table->dropForeign(['filiere_id']);
            $table->dropForeign(['niveau_id']);
            $table->dropForeign(['centre_depot_id']);
            $table->dropColumn(['filiere_id', 'niveau_id', 'centre_depot_id', 'annee_academique']);
        });
    }
};
