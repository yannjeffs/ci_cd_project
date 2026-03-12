<?php

namespace App\Http\Controllers;

use App\Models\CentreExamen;
use Illuminate\Http\Request;

class CentreExamenController extends Controller
{
    /**
     * Liste des centres d'examen
     */
    public function index()
    {
        return response()->json(CentreExamen::all(), 200);
    }

    /**
     * Créer un centre d'examen
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:centre_examens,code',
            'capacite' => 'required|integer|min:1',
            'statut' => 'required|string|max:50',
            'adresse' => 'required|string|max:255',
        ]);

        $centreExamen = CentreExamen::create($validated);

        return response()->json($centreExamen, 201);
    }

    /**
     * Afficher un centre d'examen spécifique
     */
    public function show($id)
    {
        $centreExamen = CentreExamen::with('etudiants')->findOrFail($id);
        return response()->json($centreExamen, 200);
    }

    /**
     * Mettre à jour un centre d'examen
     */
    public function update(Request $request, $id)
    {
        $centreExamen = CentreExamen::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:centre_examens,code,' . $id . ',id_centre_examen',
            'capacite' => 'sometimes|integer|min:1',
            'statut' => 'sometimes|string|max:50',
            'adresse' => 'sometimes|string|max:255',
        ]);

        $centreExamen->update($validated);

        return response()->json($centreExamen, 200);
    }

    /**
     * Supprimer un centre d'examen
     */
    public function destroy($id)
    {
        CentreExamen::destroy($id);
        return response()->json(null, 204);
    }
}
