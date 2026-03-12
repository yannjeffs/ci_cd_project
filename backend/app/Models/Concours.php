<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Concours extends Model
{
    use HasFactory;

    protected $table = 'concours';

    protected $fillable = [
        'nom',
        'code',
        'description',
        'logo',
        'date_debut_inscription',
        'date_fin_inscription',
        'date_concours',
        'frais_inscription',
        'statut',
        'ville',
        'conditions'
    ];

    protected $casts = [
        'date_debut_inscription' => 'date',
        'date_fin_inscription' => 'date',
        'date_concours' => 'date',
        'frais_inscription' => 'decimal:2'
    ];

    public function departements(): HasMany
    {
        return $this->hasMany(Departement::class);
    }

    // Relation : un concours a plusieurs étudiants inscrits
    public function etudiants(): HasMany
    {
        return $this->hasMany(Etudiant::class);
    }

    // Vérifie si les inscriptions sont ouvertes
    public function isOpen(): bool
    {
        $today = now()->startOfDay();
        return $this->statut === 'OUVERT' 
            && $today->gte($this->date_debut_inscription) 
            && $today->lte($this->date_fin_inscription);
    }
}
