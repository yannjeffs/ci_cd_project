<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            if (!Schema::hasColumn('etudiants', 'telephone')) {
                $table->string('telephone', 20)->nullable()->after('adresse');
            }
            if (!Schema::hasColumn('etudiants', 'departement_id')) {
                $table->unsignedBigInteger('departement_id')->nullable()->after('filiere_id');
            }
            if (!Schema::hasColumn('etudiants', 'centre_depot_id')) {
                $table->unsignedBigInteger('centre_depot_id')->nullable()->after('departement_id');
            }
            if (!Schema::hasColumn('etudiants', 'centre_examen_id')) {
                $table->unsignedBigInteger('centre_examen_id')->nullable()->after('centre_depot_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('etudiants', function (Blueprint $table) {
            $table->dropColumn(['telephone', 'departement_id', 'centre_depot_id', 'centre_examen_id']);
        });
    }
};
