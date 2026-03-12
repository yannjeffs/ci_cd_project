<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Niveau extends Model {
    protected $fillable = ['nom', 'description'];

    public function etudiants(): HasMany { return $this->hasMany(Etudiant::class); }
}
