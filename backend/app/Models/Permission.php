<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    //  Clé primaire personnalisée
    protected $primaryKey = 'id_permission';

    //  Colonnes modifiables
    protected $fillable = ['nom_permission', 'description'];

    //  Relation : une permission peut appartenir à plusieurs rôles
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }
}
