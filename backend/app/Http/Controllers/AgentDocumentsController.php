<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Etudiant;
use App\Models\User;
use Illuminate\Http\Request;

class AgentDocumentsController extends Controller
{
    /**
     * Récupère les documents en attente pour l'agent, groupés par concours puis par étudiant
     */
    public function getPendingDocuments()
    {
        $documents = Document::with(['etudiant.user', 'etudiant.concours'])
            ->where('statut', 'EN_ATTENTE')
            ->get();

        return $this->groupDocumentsByConcours($documents);
    }

    /**
     * Récupère les documents archivés (validés ou rejetés) pour l'agent
     */
    public function getArchivedDocuments()
    {
        // Inclure TOUS les documents validés/rejetés, pas seulement ceux de l'agent
        // Car l'agent doit voir si l'admin a validé un document
        $documents = Document::with(['etudiant.user', 'etudiant.concours', 'agent'])
            ->whereIn('statut', ['VALIDE', 'REJETE'])
            ->orderBy('date_validation_agent', 'desc')
            ->get();

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
                    'documents' => $docs->map(function($doc) {
                        return [
                            'id' => $doc->id_document,
                            'type' => $doc->type_document,
                            'statut' => $doc->statut,
                            'date' => $doc->date_televersement,
                            'date_validation' => $doc->date_validation_agent,
                            'motif_rejet' => $doc->motif_rejet,
                            'valide_par' => $doc->agent ? $doc->agent->nom . ' ' . $doc->agent->prenom : 'Admin',
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
                'etudiants' => $groupedByStudent
            ];
        })->values();

        return response()->json(['status' => 'success', 'data' => $groupedByConcours]);
    }

    /**
     * Valide un document (par l'agent)
     */
    public function validateDocument(Request $request, $id)
    {
        $document = Document::with('etudiant.user')->findOrFail($id);

        $ancienStatut = $document->statut;

        $document->update([
            'statut' => 'VALIDE',
            'agent_id' => auth()->id(),
            'date_validation_agent' => now(),
            'motif_rejet' => null
        ]);

        // Notifier l'étudiant
        if ($document->etudiant && $document->etudiant->user) {
            \App\Models\Notification::create([
                'user_id' => $document->etudiant->user_id,
                'type' => 'DOCUMENT_VALIDE_AGENT',
                'titre' => '✅ Document validé',
                'message' => "Votre document '{$document->type_document}' a été validé par l'agent.",
                'lue' => false,
                'data' => [
                    'document_id' => $document->id_document,
                    'statut' => 'VALIDE'
                ]
            ]);
        }

        // Notifier les administrateurs
        $admins = User::whereHas('role', function($q) {
            $q->where('nom_role', 'ADMIN');
        })->get();

        foreach ($admins as $admin) {
            \App\Models\Notification::create([
                'user_id' => $admin->id,
                'type' => 'DOCUMENT_VALIDE_PAR_AGENT',
                'titre' => '✅ Document validé par un agent',
                'message' => "Le document {$document->type_document} de {$document->etudiant->user->prenom} {$document->etudiant->user->nom} a été validé par un agent.",
                'lue' => false,
                'data' => [
                    'document_id' => $document->id_document,
                    'agent_id' => auth()->id(),
                    'etudiant_id' => $document->etudiant_id
                ]
            ]);
        }

        return response()->json(['status' => 'success', 'message' => 'Document validé par l\'agent.', 'data' => $document]);
    }

    /**
     * Rejette un document (par l'agent)
     */
    public function rejectDocument(Request $request, $id)
    {
        $request->validate([
            'motif_rejet' => 'required|string'
        ]);

        $document = Document::with('etudiant.user')->findOrFail($id);

        $document->update([
            'statut' => 'REJETE',
            'agent_id' => auth()->id(),
            'date_validation_agent' => now(),
            'motif_rejet' => $request->motif_rejet
        ]);

        // Notifier l'étudiant
        if ($document->etudiant && $document->etudiant->user) {
            \App\Models\Notification::create([
                'user_id' => $document->etudiant->user_id,
                'type' => 'DOCUMENT_REJETE_AGENT',
                'titre' => '❌ Document rejeté',
                'message' => "Votre document '{$document->type_document}' a été rejeté par l'agent. Motif: {$request->motif_rejet}",
                'lue' => false,
                'data' => [
                    'document_id' => $document->id_document,
                    'motif_rejet' => $request->motif_rejet,
                    'statut' => 'REJETE'
                ]
            ]);
        }

        // Notifier les administrateurs
        $admins = User::whereHas('role', function($q) {
            $q->where('nom_role', 'ADMIN');
        })->get();

        foreach ($admins as $admin) {
            \App\Models\Notification::create([
                'user_id' => $admin->id,
                'type' => 'DOCUMENT_REJETE_PAR_AGENT',
                'titre' => '❌ Document rejeté par un agent',
                'message' => "Le document {$document->type_document} de {$document->etudiant->user->prenom} {$document->etudiant->user->nom} a été rejeté par un agent. Motif: {$request->motif_rejet}",
                'lue' => false,
                'data' => [
                    'document_id' => $document->id_document,
                    'agent_id' => auth()->id(),
                    'motif_rejet' => $request->motif_rejet
                ]
            ]);
        }

        return response()->json(['status' => 'success', 'message' => 'Document rejeté par l\'agent.', 'data' => $document]);
    }

    /**
     * Statistiques simples pour l'agent - uniquement ses propres actions
     */
    public function getStats()
    {
        $agentId = auth()->id();
        
        // Documents en attente (tous les documents EN_ATTENTE du système)
        $totalPending = Document::where('statut', 'EN_ATTENTE')->count();
        
        // Documents validés par cet agent spécifiquement
        $totalValidated = Document::where('statut', 'VALIDE')
            ->where('agent_id', $agentId)
            ->count();
        
        // Documents rejetés par cet agent spécifiquement
        $totalRejected = Document::where('statut', 'REJETE')
            ->where('agent_id', $agentId)
            ->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'pending' => $totalPending,
                'validated' => $totalValidated,
                'rejected' => $totalRejected
            ]
        ]);
    }
}
