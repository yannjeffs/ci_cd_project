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
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('nom');
        $table->string('prenom');
        $table->string('email')->unique();
        $table->string('password');
        $table->string('telephone')->nullable();
        $table->string('adresse')->nullable();
        $table->enum('status', ['ACTIF', 'INACTIF'])->default('ACTIF');
        $table->foreignId('role_id')->constrained('roles');
        $table->rememberToken();
        $table->timestamps();
    });
}
};
