<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEnrollementRequest extends FormRequest
{
    /**
     * Autoriser l'utilisateur à faire cette requête.
     */
    public function authorize(): bool
    {
        return true; // 🟢 TRÈS IMPORTANT : Passer à true
    }

    /**
     * Règles de validation pour l'enrôlement.
     */
    public function rules(): array
    {
        return [
            'etudiant_id'      => 'required|exists:etudiants,id',
            'centre_depot_id'  => 'required|exists:centre_depots,id',
            'type_enrollement' => 'required|string|in:Nouveau,Renouvellement', // Exemple de types
            'annee_academique' => 'required|string|regex:/^\d{4}-\d{4}$/',   // Format 2025-2026
        ];
    }

    /**
     * Messages d'erreur personnalisés (Optionnel mais plus pro pour le frontend).
     */
    public function messages(): array
    {
        return [
            'etudiant_id.exists'      => "L'étudiant sélectionné n'existe pas.",
            'centre_depot_id.exists'  => "Le centre de dépôt sélectionné est invalide.",
            'annee_academique.regex'  => "L'année académique doit être au format YYYY-YYYY (ex: 2025-2026).",
        ];
    }
}
