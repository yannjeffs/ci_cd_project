<?php

namespace App\Http\Controllers;

use App\Models\Departement;
use App\Models\Etudiant;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class DepartementController extends Controller
{
    /**
     * Liste des départements avec cache
     */
    public function index(Request $request)
    {
        $concoursId = $request->query('concours_id');

        // Cache pour 1 heure (3600 secondes)
        $cacheKey = $concoursId ? "departements_concours_{$concoursId}" : 'departements_all';
        
        $departements = \Cache::remember($cacheKey, 3600, function () use ($concoursId) {
            $query = Departement::query()->with('concours');

            if ($concoursId) {
                $query->where('concours_id', $concoursId);
            }

            return $query->get();
        });

        return response()->json($departements, 200);
    }

    /**
     * Créer un département
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $departement = Departement::create($validated);

        return response()->json($departement, 201);
    }

    /**
     * Afficher un département spécifique (sans charger tous les étudiants)
     */
    public function show($id)
    {
        $departement = Departement::findOrFail($id);
        return response()->json($departement, 200);
    }

    /**
     * Récupérer les étudiants d'un département avec pagination
     */
    public function getEtudiants(Request $request, $id)
    {
        $perPage = $request->query('per_page', 20);
        $filiereId = $request->query('filiere_id');

        $query = Etudiant::where('departement_id', $id)
            ->with(['user', 'filiere', 'niveau', 'concours']);

        if ($filiereId) {
            $query->where('filiere_id', $filiereId);
        }

        return response()->json($query->paginate($perPage), 200);
    }

    /**
     * Mettre à jour un département
     */
    public function update(Request $request, $id)
    {
        $departement = Departement::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $departement->update($validated);

        return response()->json($departement, 200);
    }

    /**
     * Supprimer un département
     */
    public function destroy($id)
    {
        Departement::destroy($id);
        return response()->json(null, 204);
    }

    /**
     * Récupérer les filières d'un département (pour filtrage dynamique)
     */
    public function getFilieres($id)
    {
        $departement = Departement::findOrFail($id);
        $filieres = $departement->filieres;
        
        return response()->json([
            'status' => 'success',
            'data' => $filieres
        ]);
    }

    /**
     * ADMIN : Télécharger la liste des étudiants d'un département
     * Formats supportés : PDF, Excel, CSV
     */
    public function exportEtudiants(Request $request, $id)
    {
        $format = $request->query('format', 'pdf'); // pdf, excel, csv
        $filiereId = $request->query('filiere_id', null);
        
        $departement = Departement::findOrFail($id);
        
        // Export Excel
        if ($format === 'excel') {
            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\EtudiantsExport($id, $filiereId), 
                "Etudiants_{$departement->nom}.xlsx"
            );
        }
        
        // Export CSV
        if ($format === 'csv') {
            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\EtudiantsExport($id, $filiereId), 
                "Etudiants_{$departement->nom}.csv",
                \Maatwebsite\Excel\Excel::CSV
            );
        }
        
        // Export PDF (par défaut)
        $etudiants = Etudiant::with(['user', 'filiere', 'niveau', 'concours', 'enrollements'])
            ->where('departement_id', $id);
        
        if ($filiereId) {
            $etudiants->where('filiere_id', $filiereId);
        }
        
        $etudiants = $etudiants->orderBy('matricule')->get();

        $data = [
            'departement' => $departement,
            'etudiants' => $etudiants,
            'date' => now()->format('d/m/Y à H:i')
        ];

        $pdf = Pdf::loadView('pdf.etudiants-departement', $data);
        $pdf->setPaper('A4', 'landscape');
        
        return $pdf->stream("Liste_Etudiants_{$departement->nom}.pdf");
    }
}
