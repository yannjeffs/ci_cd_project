<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use Illuminate\Http\Request;

class EtudiantController extends Controller
{
    /**
     * ADMIN : Liste tous les étudiants avec pagination
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 20);
        $search = $request->query('search', '');
        $departementId = $request->query('departement_id');
        $concoursId = $request->query('concours_id');

        $query = Etudiant::with(['user', 'filiere', 'niveau', 'departement', 'centreDepot', 'centreExamen', 'concours']);

        // Filtres
        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('matricule', 'like', "%{$search}%");
        }

        if ($departementId) {
            $query->where('departement_id', $departementId);
        }

        if ($concoursId) {
            $query->where('concours_id', $concoursId);
        }

        return response()->json($query->paginate($perPage));
    }

    /**
     * ADMIN : Voir un étudiant spécifique
     */
    public function show($id)
    {
        $etudiant = Etudiant::with(['user', 'filiere', 'niveau', 'departement', 'centreDepot', 'centreExamen', 'concours'])->findOrFail($id);
        return response()->json($etudiant);
    }

    /**
     * ETUDIANT : Créer son profil étudiant
     */
    public function store(Request $request)
    {
        // Vérifier si l'utilisateur a déjà un profil étudiant
        $existingProfile = Etudiant::where('user_id', auth()->id())->first();
        if ($existingProfile) {
            return response()->json([
                'message' => 'Vous avez déjà un profil étudiant.',
                'etudiant' => $existingProfile->load(['filiere', 'niveau', 'departement', 'centreDepot', 'centreExamen', 'concours'])
            ], 409);
        }

        $validated = $request->validate([
            'matricule' => 'required|unique:etudiants',
            'date_naissance' => 'required|date',
            'sexe' => 'required|in:M,F',
            'adresse' => 'required|string',
            'telephone' => 'required|string|max:20',
            'numero_cni' => 'required|string|max:50',
            'region_origine' => 'required|string|max:100',
            'departement_origine' => 'required|string|max:100',
            'langue_parlee' => 'required|string|max:50',
            'nom_pere' => 'required|string|max:255',
            'telephone_pere' => 'required|string|max:20',
            'nom_mere' => 'required|string|max:255',
            'telephone_mere' => 'required|string|max:20',
            'filiere_id' => 'required|exists:filieres,id',
            'niveau_id' => 'required|exists:niveaux,id',
            'departement_id' => 'required|exists:departements,id',
            'centre_depot_id' => 'required|exists:centre_depots,id_centre_depot',
            'centre_examen_id' => 'required|exists:centre_examens,id_centre_examen',
            'concours_id' => 'required|exists:concours,id',
        ]);

        $etudiant = Etudiant::create(array_merge(
            $validated,
            ['user_id' => auth()->id(), 'date_inscription' => now()]
        ));

        // Mettre à jour le téléphone de l'utilisateur aussi
        auth()->user()->update(['telephone' => $validated['telephone']]);

        return response()->json([
            'message' => 'Profil étudiant créé avec succès !',
            'etudiant' => $etudiant->load(['filiere', 'niveau', 'departement', 'centreDepot', 'centreExamen', 'concours'])
        ], 201);
    }

    /**
     * ADMIN : Mettre à jour un étudiant
     */
    public function update(Request $request, $id)
    {
        $etudiant = Etudiant::findOrFail($id);

        $validated = $request->validate([
            'matricule' => 'sometimes|unique:etudiants,matricule,' . $id,
            'date_naissance' => 'sometimes|date',
            'sexe' => 'sometimes|in:M,F',
            'adresse' => 'sometimes|string',
            'filiere_id' => 'sometimes|exists:filieres,id',
            'niveau_id' => 'sometimes|exists:niveaux,id',
        ]);

        $etudiant->update($validated);

        return response()->json([
            'message' => 'Étudiant mis à jour avec succès',
            'etudiant' => $etudiant->load(['user', 'filiere', 'niveau'])
        ]);
    }

    /**
     * ADMIN : Supprimer un étudiant
     */
    public function destroy($id)
    {
        $etudiant = Etudiant::findOrFail($id);
        $etudiant->delete();

        return response()->json(['message' => 'Étudiant supprimé'], 204);
    }

    /**
     * ETUDIANT : Récupérer son propre profil
     */
    public function me()
    {
        return response()->json(
            auth()->user()->load('etudiant.filiere', 'etudiant.niveau')
        );
    }
}
