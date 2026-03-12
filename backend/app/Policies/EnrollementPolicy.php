<?php

namespace App\Policies;

use App\Models\Enrollement;
use App\Models\User;

class EnrollementPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admins et agents peuvent voir tous les enrôlements
        return $user->hasRole(['admin', 'agent']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Enrollement $enrollement): bool
    {
        // Un étudiant peut voir ses propres enrôlements
        if ($user->hasRole('etudiant') && $user->etudiant) {
            return $user->etudiant->id === $enrollement->etudiant_id;
        }

        // Admins et agents peuvent voir tous les enrôlements
        return $user->hasRole(['admin', 'agent']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Seuls les étudiants peuvent créer des enrôlements
        return $user->hasRole('etudiant') && $user->etudiant !== null;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Enrollement $enrollement): bool
    {
        // Admins peuvent tout modifier
        if ($user->hasRole('admin')) {
            return true;
        }

        // Agents peuvent valider les enrôlements de leur centre
        if ($user->hasRole('agent')) {
            return $enrollement->centre_depot_id === $user->centre_depot_id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Enrollement $enrollement): bool
    {
        // Seuls les admins peuvent supprimer
        return $user->hasRole('admin');
    }
}
