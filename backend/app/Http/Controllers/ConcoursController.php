<?php

namespace App\Http\Controllers;

use App\Models\Concours;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class ConcoursController extends Controller
{
    /**
     * Liste des concours (publique - pour le choix initial) avec cache
     */
    public function index()
    {
        // Cache pour 30 minutes
        return response()->json(
            Cache::remember('concours_all', 1800, function () {
                return Concours::orderBy('date_concours', 'asc')->get();
            })
        );
    }

    /**
     * Liste des concours ouverts uniquement avec cache
     */
    public function ouverts()
    {
        $today = now()->startOfDay();

        // Cache pour 10 minutes (les concours ouverts changent moins souvent)
        return response()->json(
            Cache::remember('concours_ouverts', 600, function () use ($today) {
                return Concours::where('statut', 'OUVERT')
                    ->where('date_debut_inscription', '<=', $today)
                    ->where('date_fin_inscription', '>=', $today)
                    ->orderBy('date_concours', 'asc')
                    ->get();
            })
        );
    }

    /**
     * Détails d'un concours
     */
    public function show($id)
    {
        $concours = Concours::findOrFail($id);
        return response()->json($concours);
    }

    /**
     * Créer un concours (Admin)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:concours,code',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'date_debut_inscription' => 'required|date',
            'date_fin_inscription' => 'required|date|after_or_equal:date_debut_inscription',
            'date_concours' => 'required|date|after:date_fin_inscription',
            'frais_inscription' => 'required|numeric|min:0',
            'statut' => 'required|in:OUVERT,FERME,TERMINE',
            'ville' => 'nullable|string|max:100',
            'conditions' => 'nullable|string'
        ]);

        // Upload du logo si présent
        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('logos', 'public');
        }

        $concours = Concours::create($validated);

        // Invalider le cache
        Cache::forget('concours_all');
        Cache::forget('concours_ouverts');

        return response()->json([
            'message' => 'Concours créé avec succès',
            'data' => $concours
        ], 201);
    }

    /**
     * Mettre à jour un concours (Admin)
     */
    public function update(Request $request, $id)
    {
        $concours = Concours::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:concours,code,' . $id,
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'date_debut_inscription' => 'sometimes|date',
            'date_fin_inscription' => 'sometimes|date',
            'date_concours' => 'sometimes|date',
            'frais_inscription' => 'sometimes|numeric|min:0',
            'statut' => 'sometimes|in:OUVERT,FERME,TERMINE',
            'ville' => 'nullable|string|max:100',
            'conditions' => 'nullable|string'
        ]);

        // Upload du nouveau logo si présent
        if ($request->hasFile('logo')) {
            // Supprimer l'ancien logo
            if ($concours->logo) {
                Storage::disk('public')->delete($concours->logo);
            }
            $validated['logo'] = $request->file('logo')->store('logos', 'public');
        }

        $concours->update($validated);

        // Invalider le cache
        Cache::forget('concours_all');
        Cache::forget('concours_ouverts');

        return response()->json([
            'message' => 'Concours mis à jour',
            'data' => $concours
        ]);
    }

    /**
     * Supprimer un concours (Admin)
     */
    public function destroy($id)
    {
        Concours::destroy($id);

        // Invalider le cache
        Cache::forget('concours_all');
        Cache::forget('concours_ouverts');

        return response()->json(null, 204);
    }
}
