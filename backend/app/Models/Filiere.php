<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

class Filiere extends Model {
    protected $fillable = ['code_filiere', 'nom', 'departement_id'];

    public function departement(): BelongsTo { return $this->belongsTo(Departement::class); }
    public function etudiants(): HasMany { return $this->hasMany(Etudiant::class); }
}

