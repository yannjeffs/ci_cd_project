<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            if (!Schema::hasColumn('documents', 'agent_id')) {
                $table->unsignedBigInteger('agent_id')->nullable()->after('statut');
            }

            if (!Schema::hasColumn('documents', 'motif_rejet')) {
                $table->string('motif_rejet')->nullable()->after('agent_id');
            }

            if (!Schema::hasColumn('documents', 'date_validation_agent')) {
                $table->timestamp('date_validation_agent')->nullable()->after('motif_rejet');
            }

            // Foreign key (create only if not exists)
            if (!Schema::hasColumn('documents', 'agent_id')) {
                $table->foreign('agent_id')->references('id')->on('users')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['agent_id']);
            $table->dropColumn(['agent_id', 'motif_rejet', 'date_validation_agent']);
        });
    }
};
