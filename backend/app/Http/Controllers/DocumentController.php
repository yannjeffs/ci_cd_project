<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Enrollement;
use App\Models\Etudiant;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * ADMIN : Liste tous les documents groupés par étudiant
     */
    public function index()
    {
        $documents = Document::with(['etudiant.user', 'concours'])->get();

        // Grouper les documents par étudiant
        $groupedByStudent = $documents->groupBy('etudiant_id')->map(function($docs, $etudiantId) {
            $etudiant = $docs->first()->etudiant;

            return [
                'etudiant_id' => $etudiantId,
                'etudiant_nom' => $etudiant && $etudiant->user
                                  ? $etudiant->user->nom . ' ' . $etudiant->user->prenom
                                  : 'Inconnu',
                'etudiant_email' => $etudiant && $etudiant->user ? $etudiant->user->email : null,
                'statistiques' => [
                    'total' => $docs->count(),
                    'valides' => $docs->where('statut', 'VALIDE')->count(),
                    'en_attente' => $docs->where('statut', 'EN_ATTENTE')->count(),
                    'rejetes' => $docs->where('statut', 'REJETE')->count(),
                ],
                'documents' => $docs->map(function($doc) {
                    return [
                        'id' => $doc->id_document,
                        'type' => $doc->type_document,
                        'statut' => $doc->statut,
                        'date' => $doc->date_televersement,
                        'url' => asset('storage/' . $doc->fichier_path),
                        'concours_id' => $doc->concours_id,
                        'concours_nom' => $doc->concours ? $doc->concours->nom : null,
                        'concours_code' => $doc->concours ? $doc->concours->code : null,
                    ];
                })->values()
            ];
        })->values();

        return response()->json([
            'status' => 'success',
            'data' => $groupedByStudent
        ]);
    }

    /**
     * ÉTUDIANT : Upload d'un nouveau document
     */
    public function store(Request $request)
    {
        $etudiant = Etudiant::where('user_id', auth()->id())->first();

        if (!$etudiant) {
            return response()->json(['message' => 'Profil étudiant introuvable.'], 404);
        }

        $request->validate([
            'type_document' => 'required|string',
            'fichier' => 'required|file|mimes:pdf,jpg,png|max:10240',
        ]);

        // Get active enrollement's concours_id from session or latest enrollement
        $concoursId = session('active_concours_id');
        
        if (!$concoursId) {
            // Fallback: get the latest enrollement's concours_id
            $activeEnrollement = Enrollement::where('etudiant_id', $etudiant->id)
                ->orderBy('created_at', 'desc')
                ->first();
            $concoursId = $activeEnrollement ? $activeEnrollement->concours_id : $etudiant->concours_id;
        }

        if ($request->hasFile('fichier')) {
            $file = $request->file('fichier');
            // Sauvegarde dans storage/app/public/documents
            $path = $file->store('documents', 'public');

            $document = Document::create([
                'etudiant_id'       => $etudiant->id,
                'type_document'     => $request->input('type_document'),
                'fichier_path'      => $path,
                'date_televersement' => now(),
                'statut'            => 'EN_ATTENTE',
                'departement_id'    => $etudiant->departement_id ?? 1,
                'concours_id'       => $concoursId
            ]);

            // Notification simple aux administrateurs
            $admins = \App\Models\User::whereHas('role', function($q) {
                $q->where('nom_role', 'ADMIN');
            })->get();

            foreach ($admins as $admin) {
                \App\Models\Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'NOUVEAU_DOCUMENT',
                    'titre' => '📄 Nouveau document',
                    'message' => "{$etudiant->user->prenom} {$etudiant->user->nom} a soumis un document : {$request->input('type_document')}",
                    'lue' => false,
                    'data' => [
                        'document_id' => $document->id_document,
                        'etudiant_id' => $etudiant->id,
                        'type_document' => $document->type_document
                    ]
                ]);
            }

            // Notification simple aux agents
            $agents = \App\Models\User::whereHas('role', function($q) {
                $q->where('nom_role', 'AGENT_DOCUMENTS');
            })->get();

            foreach ($agents as $agent) {
                \App\Models\Notification::create([
                    'user_id' => $agent->id,
                    'type' => 'NOUVEAU_DOCUMENT',
                    'titre' => '📄 Nouveau document à vérifier',
                    'message' => "{$etudiant->user->prenom} {$etudiant->user->nom} a soumis un document : {$request->input('type_document')}",
                    'lue' => false,
                    'data' => [
                        'document_id' => $document->id_document,
                        'etudiant_id' => $etudiant->id,
                        'type_document' => $document->type_document
                    ]
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Document enregistré avec succès !',
                'data' => $document
            ], 201);
        }
    }

    /**
     * ADMIN : Valider ou Rejeter un document
     */
    public function valider(Request $request, $id)
    {
        $document = Document::with('etudiant.user')->findOrFail($id);

        $request->validate([
            'statut' => 'required|in:VALIDE,REJETE,EN_ATTENTE'
        ]);

        $ancienStatut = $document->statut;
        $document->update([
            'statut' => $request->statut
        ]);

        // Créer une notification pour l'étudiant si le statut a changé
        if ($ancienStatut !== $request->statut && $document->etudiant && $document->etudiant->user) {
            $type = $request->statut === 'VALIDE' ? 'DOCUMENT_VALIDE' : 'DOCUMENT_REJETE';
            $titre = $request->statut === 'VALIDE'
                ? '✅ Document validé'
                : '❌ Document rejeté';
            $message = $request->statut === 'VALIDE'
                ? "Votre document '{$document->type_document}' a été validé par l'administration."
                : "Votre document '{$document->type_document}' a été rejeté. Veuillez soumettre un nouveau document.";

            \App\Models\Notification::create([
                'user_id' => $document->etudiant->user_id,
                'type' => $type,
                'titre' => $titre,
                'message' => $message,
                'lue' => false,
                'data' => [
                    'document_id' => $document->id_document,
                    'type_document' => $document->type_document,
                    'statut' => $request->statut
                ]
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Le statut du document a été mis à jour.',
            'data' => $document
        ]);
    }

    /**
     * Voir un document spécifique
     */
    public function show($id)
    {
        $document = Document::with('etudiant.user')->findOrFail($id);
        return response()->json(['status' => 'success', 'data' => $document]);
    }

    /**
     * ÉTUDIANT : Récupérer ses propres documents
     */
    public function myDocuments()
    {
        $etudiant = Etudiant::where('user_id', auth()->id())->first();

        if (!$etudiant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil étudiant introuvable.',
                'data' => []
            ], 404);
        }

        // Get active enrollement's concours_id from session or latest enrollement
        $concoursId = session('active_concours_id');
        
        if (!$concoursId) {
            // Fallback: get the latest enrollement's concours_id
            $activeEnrollement = Enrollement::where('etudiant_id', $etudiant->id)
                ->orderBy('created_at', 'desc')
                ->first();
            $concoursId = $activeEnrollement ? $activeEnrollement->concours_id : null;
        }

        // ✅ Limiter les colonnes pour réduire la taille de la réponse
        $query = Document::where('etudiant_id', $etudiant->id)
            ->select(['id_document', 'type_document', 'fichier_path', 'date_televersement', 'statut', 'etudiant_id', 'concours_id']);
        
        // Filter by concours_id if available
        if ($concoursId) {
            $query->where('concours_id', $concoursId);
        }
        
        $documents = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $documents
        ]);
    }

    /**
     * ADMIN : Valider tous les documents EN_ATTENTE d'un étudiant
     */
    public function validerTousDocuments($etudiantId)
    {
        $etudiant = Etudiant::with('user')->findOrFail($etudiantId);

        // Récupérer tous les documents en attente
        $documentsEnAttente = Document::where('etudiant_id', $etudiantId)
            ->where('statut', 'EN_ATTENTE')
            ->get();

        if ($documentsEnAttente->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aucun document en attente pour cet étudiant.'
            ], 400);
        }

        // Valider tous les documents
        $nombreValides = $documentsEnAttente->count();
        Document::where('etudiant_id', $etudiantId)
            ->where('statut', 'EN_ATTENTE')
            ->update(['statut' => 'VALIDE']);

        // Créer une notification pour l'étudiant
        if ($etudiant->user) {
            \App\Models\Notification::create([
                'user_id' => $etudiant->user_id,
                'type' => 'DOCUMENTS_VALIDES',
                'titre' => '✅ Tous vos documents ont été validés',
                'message' => "Félicitations ! Tous vos documents ({$nombreValides} document(s)) ont été validés par l'administration. Vous pouvez maintenant procéder au paiement.",
                'data' => [
                    'nombre_documents' => $nombreValides,
                    'etudiant_id' => $etudiantId
                ]
            ]);

            // Envoyer notification WhatsApp (optionnel)
            $this->sendWhatsAppNotification(
                $etudiant->user->telephone ?? null,
                "✅ Félicitations {$etudiant->user->prenom} ! Tous vos documents ont été validés. Vous pouvez maintenant procéder au paiement."
            );
        }

        return response()->json([
            'status' => 'success',
            'message' => "{$nombreValides} document(s) validé(s) avec succès.",
            'data' => [
                'nombre_valides' => $nombreValides,
                'etudiant' => $etudiant->user ? $etudiant->user->nom . ' ' . $etudiant->user->prenom : 'Inconnu'
            ]
        ]);
    }

    /**
     * Envoyer une notification WhatsApp via API
     */
    private function sendWhatsAppNotification($telephone, $message)
    {
        if (!$telephone) {
            \Log::warning('Pas de numéro de téléphone pour la notification WhatsApp');
            return false;
        }

        try {
            $apiUrl = "https://api.callmebot.com/whatsapp.php";
            $response = \Http::get($apiUrl, [
                'phone' => $telephone,
                'text' => $message,
                'apikey' => env('CALLMEBOT_API_KEY', '')
            ]);

            \Log::info('Notification WhatsApp envoyée', [
                'telephone' => $telephone,
                'status' => $response->status()
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            \Log::error('Erreur envoi WhatsApp: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * CENTRE DEPOT : Liste tous les documents groupés par étudiant
     */
    public function indexCentre()
    {
        // Même logique que l'admin, mais peut-être filtré différemment si nécessaire
        // Pour l'instant, le Centre voit tout comme l'Admin
        $documents = Document::with(['etudiant.user'])->get();

        $groupedByStudent = $documents->groupBy('etudiant_id')->map(function($docs, $etudiantId) {
            $etudiant = $docs->first()->etudiant;

            return [
                'etudiant_id' => $etudiantId,
                'etudiant_nom' => $etudiant && $etudiant->user
                                  ? $etudiant->user->nom . ' ' . $etudiant->user->prenom
                                  : 'Inconnu',
                'etudiant_email' => $etudiant && $etudiant->user ? $etudiant->user->email : null,
                'statistiques' => [
                    'total' => $docs->count(),
                    'valides' => $docs->where('statut', 'VALIDE')->count(),
                    'valides_centre' => $docs->where('statut', 'VALIDE_CENTRE')->count(),
                    'en_attente' => $docs->where('statut', 'EN_ATTENTE')->count(),
                    'rejetes' => $docs->whereIn('statut', ['REJETE', 'REJETE_CENTRE'])->count(),
                ],
                'documents' => $docs->map(function($doc) {
                    return [
                        'id' => $doc->id_document,
                        'type' => $doc->type_document,
                        'statut' => $doc->statut,
                        'date' => $doc->date_televersement,
                        'url' => asset('storage/' . $doc->fichier_path)
                    ];
                })->values()
            ];
        })->values();

        return response()->json([
            'status' => 'success',
            'data' => $groupedByStudent
        ]);
    }

    /**
     * CENTRE DEPOT : Valider ou Rejeter (Intermédiaire)
     */
    public function validerCentre(Request $request, $id)
    {
        $document = Document::with('etudiant.user')->findOrFail($id);

        $request->validate([
            'statut' => 'required|in:VALIDE_CENTRE,REJETE_CENTRE'
        ]);

        $ancienStatut = $document->statut;
        $document->update([
            'statut' => $request->statut
        ]);

        // Créer une notification pour l'étudiant
        if ($ancienStatut !== $request->statut && $document->etudiant && $document->etudiant->user) {
            $type = $request->statut === 'VALIDE_CENTRE' ? 'DOCUMENT_VALIDE_CENTRE' : 'DOCUMENT_REJETE_CENTRE';
            $titre = $request->statut === 'VALIDE_CENTRE'
                ? '✅ Document pré-validé'
                : '❌ Document rejeté';
            $message = $request->statut === 'VALIDE_CENTRE'
                ? "Votre document '{$document->type_document}' a été validé par le Centre de Dépôt. Il est en attente de validation finale."
                : "Votre document '{$document->type_document}' a été rejeté par le Centre de Dépôt. Veuillez soumettre un nouveau document.";

            \App\Models\Notification::create([
                'user_id' => $document->etudiant->user_id,
                'type' => $type,
                'titre' => $titre,
                'message' => $message,
                'data' => [
                    'document_id' => $document->id_document,
                    'type_document' => $document->type_document,
                    'statut' => $request->statut
                ]
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Le statut du document a été mis à jour par le Centre de Dépôt.',
            'data' => $document
        ]);
    }

}
