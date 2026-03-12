<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    protected $fillable = [
        'nom_role',
        'description_role'
    ];

    /**
     * Un rôle possède plusieurs utilisateurs.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'role_id');
    }

    /**
     * Un rôle possède plusieurs permissions.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(
            Permission::class,
            'role_permissions',
            'role_id',
            'permission_id'
        );
    }

    /**
     * On renomme 'is' en 'checkNom' pour éviter le conflit avec Laravel
     */
    public function checkNom(string $nom): bool
    {
        return $this->nom_role === $nom;
    }
}
