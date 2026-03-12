<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CentreExamen extends Model
{
    use HasFactory;

    protected $table = 'centre_examens';
    protected $primaryKey = 'id_centre_examen';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'nom',
        'code',
        'capacite',
        'statut',
        'adresse',
    ];

    // Relation : un centre d'examen peut accueillir plusieurs étudiants
    public function etudiants()
    {
        return $this->hasMany(Etudiant::class, 'centre_examen_id', 'id_centre_examen');
    }
}
