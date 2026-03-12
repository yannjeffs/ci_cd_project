<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Departement extends Model {
    protected $fillable = ['nom', 'description', 'concours_id'];

    public function concours() { return $this->belongsTo(Concours::class); }

    public function filieres(): HasMany { return $this->hasMany(Filiere::class); }
}
