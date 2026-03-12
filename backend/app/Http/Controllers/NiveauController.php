<?php

namespace App\Http\Controllers;

use App\Models\Niveau;
use Illuminate\Http\Request;

class NiveauController extends Controller
{
    /**
     * Liste des niveaux
     */
    public function index()
    {
        return response()->json(Niveau::all(), 200);
    }

    /**
     * Créer un niveau
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $niveau = Niveau::create($validated);

        return response()->json($niveau, 201);
    }

    /**
     * Afficher un niveau spécifique
     */
    public function show($id)
    {
        $niveau = Niveau::with('etudiants')->findOrFail($id);
        return response()->json($niveau, 200);
    }

    /**
     * Mettre à jour un niveau
     */
    public function update(Request $request, $id)
    {
        $niveau = Niveau::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $niveau->update($validated);

        return response()->json($niveau, 200);
    }

    /**
     * Supprimer un niveau
     */
    public function destroy($id)
    {
        Niveau::destroy($id);
        return response()->json(null, 204);
    }
}
