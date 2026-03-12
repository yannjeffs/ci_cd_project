<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    // Configuration de la table
    protected $table = 'documents';
    protected $primaryKey = 'id_document'; // Important car ta clé n'est pas 'id'

    protected $fillable = [
        'etudiant_id',
        'concours_id',        // NOUVEAU : Support inscriptions multiples
        'type_document',
        'fichier_path',
        'date_televersement',
        'statut',
        'departement_id',
        'agent_id',
        'motif_rejet',
        'date_validation_agent'
    ];

    // Relation avec l'étudiant
    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class, 'etudiant_id');
    }

    // Relation avec le concours
    public function concours()
    {
        return $this->belongsTo(Concours::class);
    }

    // Relation avec l'agent
    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    // Scope pour filtrer par concours
    public function scopeForConcours($query, $concoursId)
    {
        return $query->where('concours_id', $concoursId);
    }
}
