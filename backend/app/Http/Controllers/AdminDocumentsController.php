<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;

class AdminDocumentsController extends Controller
{
    /**
     * Récupère les documents pour l'admin, groupés par concours puis par étudiant
     */
    public function getDocumentsByConcours(Request $request)
    {
        $statut = $request->query('statut', 'all'); // all, EN_ATTENTE, VALIDE, REJETE

        $query = Document::with(['etudiant.user', 'etudiant.concours', 'agent']);

        if ($statut !== 'all') {
            $query->where('statut', $statut);
        }

        $documents = $query->orderBy('date_televersement', 'desc')->get();

        return $this->groupDocumentsByConcours($documents);
    }

    /**
     * Méthode privée pour grouper les documents par concours et étudiant
     */
    private function groupDocumentsByConcours($documents)
    {
        // Grouper par concours, puis par étudiant
        $groupedByConcours = $documents->groupBy(function($doc) {
            return $doc->etudiant && $doc->etudiant->concours 
                ? $doc->etudiant->concours->id 
                : 0; // 0 pour les étudiants sans concours
        })->map(function($concoursDocs, $concoursId) {
            $firstDoc = $concoursDocs->first();
            $concours = $firstDoc->etudiant && $firstDoc->etudiant->concours 
                ? $firstDoc->etudiant->concours 
                : null;

            // Grouper par étudiant dans ce concours
            $groupedByStudent = $concoursDocs->groupBy('etudiant_id')->map(function($docs, $etudiantId) {
                $etudiant = $docs->first()->etudiant;
                return [
                    'etudiant_id' => $etudiantId,
                    'etudiant_nom' => $etudiant && $etudiant->user ? $etudiant->user->nom . ' ' . $etudiant->user->prenom : 'Inconnu',
                    'etudiant_email' => $etudiant && $etudiant->user ? $etudiant->user->email : null,
                    'nombre_documents' => $docs->count(),
                    'statistiques' => [
                        'total' => $docs->count(),
                        'en_attente' => $docs->where('statut', 'EN_ATTENTE')->count(),
                        'valides' => $docs->where('statut', 'VALIDE')->count(),
                        'rejetes' => $docs->where('statut', 'REJETE')->count(),
                    ],
                    'documents' => $docs->map(function($doc) {
                        return [
                            'id' => $doc->id_document,
                            'type' => $doc->type_document,
                            'statut' => $doc->statut,
                            'date' => $doc->date_televersement,
                            'date_validation' => $doc->date_validation_agent,
                            'motif_rejet' => $doc->motif_rejet,
                            'valide_par' => $doc->agent ? $doc->agent->nom . ' ' . $doc->agent->prenom : null,
                            'url' => asset('storage/' . $doc->fichier_path)
                        ];
                    })->values()
                ];
            })->values();

            return [
                'concours_id' => $concoursId,
                'concours_nom' => $concours ? $concours->nom : 'Sans concours',
                'concours_annee' => $concours ? $concours->annee : null,
                'total_etudiants' => $groupedByStudent->count(),
                'total_documents' => $concoursDocs->count(),
                'statistiques' => [
                    'en_attente' => $concoursDocs->where('statut', 'EN_ATTENTE')->count(),
                    'valides' => $concoursDocs->where('statut', 'VALIDE')->count(),
                    'rejetes' => $concoursDocs->where('statut', 'REJETE')->count(),
                ],
                'etudiants' => $groupedByStudent
            ];
        })->values();

        return response()->json(['status' => 'success', 'data' => $groupedByConcours]);
    }
}
