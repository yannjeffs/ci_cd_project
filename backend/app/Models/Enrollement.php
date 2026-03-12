<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollement extends Model
{
    use HasFactory;

    protected $fillable = [
        'etudiant_id',
        'concours_id',        // NOUVEAU : Support inscriptions multiples
        'departement_id',     // NOUVEAU : Département spécifique au concours
        'filiere_id',
        'niveau_id',
        'centre_depot_id',
        'annee_academique',
        'date_enrolement',
        'statut'
    ];

    // Relation avec l'étudiant
    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    // Relation avec le concours
    public function concours()
    {
        return $this->belongsTo(Concours::class);
    }

    // Relation avec le département
    public function departement()
    {
        return $this->belongsTo(Departement::class);
    }

    // Relation avec la filière
    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    // AJOUT DE LA RELATION MANQUANTE
    public function niveau()
    {
        return $this->belongsTo(Niveau::class);
    }

    // Relation avec le centre de dépôt
    public function centreDepot()
    {
        return $this->belongsTo(CentreDepot::class, 'centre_depot_id', 'id_centre_depot');
    }

    // Scope pour filtrer par concours
    public function scopeForConcours($query, $concoursId)
    {
        return $query->where('concours_id', $concoursId);
    }
}
