<?php

namespace App\Http\Controllers;

use App\Models\CentreDepot;
use Illuminate\Http\Request;

class CentreDepotController extends Controller
{
    public function index()
    {
        return response()->json(CentreDepot::all(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'     => 'required|string|max:255',
            'code'    => 'required|string|unique:centre_depots,code',
            'statut'  => 'required|in:ACTIF,INACTIF',
            'region'  => 'required|string',
            'adresse' => 'nullable|string',
        ]);

        $centre = CentreDepot::create($validated);

        return response()->json([
            'message' => 'Centre de dépôt créé avec succès',
            'data'    => $centre
        ], 201);
    }

    public function show($id)
    {
        $centre = CentreDepot::with('enrollements.etudiant.user')->findOrFail($id);
        return response()->json($centre, 200);
    }
}
