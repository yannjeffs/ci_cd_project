<?php

namespace App\Http\Controllers;

use App\Models\Filiere;
use Illuminate\Http\Request;

class FiliereController extends Controller
{
    /**
     * Liste des filières avec leurs départements respectifs (avec cache)
     */
    public function index()
    {
        // Cache pour 1 heure
        return response()->json(
            \Cache::remember('filieres_all', 3600, function () {
                return Filiere::with('departement')->get();
            }), 
            200
        );
    }

    /**
     * Créer une filière liée à un département
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'            => 'required|string|max:255',
            'code_filiere'   => 'required|string|unique:filieres,code_filiere',
            'departement_id' => 'required|exists:departements,id',
        ]);

        $filiere = Filiere::create($validated);

        // Invalider le cache
        \Cache::forget('filieres_all');

        return response()->json([
            'message' => 'Filiere créée avec succès',
            'data'    => $filiere
        ], 201);
    }

    /**
     * Voir une filière et la liste des étudiants inscrits
     */
    public function show($id)
    {
        $filiere = Filiere::with(['departement', 'etudiants.user'])->findOrFail($id);
        return response()->json($filiere, 200);
    }

    public function update(Request $request, $id)
    {
        $filiere = Filiere::findOrFail($id);

        $validated = $request->validate([
            'nom'            => 'sometimes|string',
            'departement_id' => 'sometimes|exists:departements,id',
        ]);

        $filiere->update($validated);
        
        // Invalider le cache
        \Cache::forget('filieres_all');
        
        return response()->json($filiere, 200);
    }

    public function destroy($id)
    {
        $filiere = Filiere::findOrFail($id);
        $filiere->delete();
        
        // Invalider le cache
        \Cache::forget('filieres_all');
        
        return response()->json(['message' => 'Filiere supprimée'], 204);
    }
}
 