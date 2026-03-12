<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Etudiant extends Model
{
    use HasFactory;

    protected $fillable = [
        'matricule',
        'date_naissance',
        'sexe',
        'adresse',
        'telephone',
        'numero_cni',
        'region_origine',
        'departement_origine',
        'langue_parlee',
        'nom_pere',
        'telephone_pere',
        'nom_mere',
        'telephone_mere',
        'date_inscription',
        'user_id',
        'niveau_id',
        'filiere_id',
        'departement_id',
        'centre_depot_id',
        'centre_examen_id',
        'concours_id'
    ];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function niveau(): BelongsTo {
        return $this->belongsTo(Niveau::class);
    }

    public function filiere(): BelongsTo {
        return $this->belongsTo(Filiere::class);
    }

    public function departement(): BelongsTo {
        return $this->belongsTo(Departement::class);
    }

    public function centreDepot(): BelongsTo {
        return $this->belongsTo(CentreDepot::class, 'centre_depot_id', 'id_centre_depot');
    }

    public function centreExamen(): BelongsTo {
        return $this->belongsTo(CentreExamen::class, 'centre_examen_id', 'id_centre_examen');
    }

    public function concours(): BelongsTo {
        return $this->belongsTo(Concours::class);
    }

    public function enrollements()
    {
        return $this->hasMany(\App\Models\Enrollement::class);
    }

    // Relation many-to-many avec Concours via enrollements
    public function concoursEnrolled()
    {
        return $this->belongsToMany(Concours::class, 'enrollements')
                    ->withPivot('id', 'statut', 'date_enrolement', 'filiere_id', 'departement_id', 'niveau_id', 'centre_depot_id')
                    ->withTimestamps();
    }

    // Méthode helper pour vérifier si l'étudiant est inscrit à un concours
    public function hasEnrollementForConcours($concoursId)
    {
        return $this->enrollements()->where('concours_id', $concoursId)->exists();
    }

    // Méthode helper pour obtenir l'enrôlement actif (depuis la session)
    public function getActiveEnrollementAttribute()
    {
        $activeConcoursId = session('active_concours_id');
        if (!$activeConcoursId) {
            // Retourner le premier enrôlement par défaut
            return $this->enrollements()->latest()->first();
        }
        return $this->enrollements()->where('concours_id', $activeConcoursId)->first();
    }
}
