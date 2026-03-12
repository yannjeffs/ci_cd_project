<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->string('numero_cni')->nullable()->after('telephone');
            $table->string('region_origine')->nullable()->after('adresse');
            $table->string('departement_origine')->nullable()->after('region_origine');
            $table->string('langue_parlee')->nullable()->after('sexe');
            $table->string('nom_pere')->nullable()->after('langue_parlee');
            $table->string('telephone_pere')->nullable()->after('nom_pere');
            $table->string('nom_mere')->nullable()->after('telephone_pere');
            $table->string('telephone_mere')->nullable()->after('nom_mere');
        });
    }

    public function down(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->dropColumn([
                'numero_cni',
                'region_origine',
                'departement_origine',
                'langue_parlee',
                'nom_pere',
                'telephone_pere',
                'nom_mere',
                'telephone_mere'
            ]);
        });
    }
};
