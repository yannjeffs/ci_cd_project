<?php

namespace App\Http\Controllers;

use App\Models\Paiement;
use App\Models\Etudiant;
use App\Models\Document;
use App\Models\Enrollement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaiementController extends Controller
{
    // Documents requis pour valider le paiement
    private const REQUIRED_DOCUMENTS = ['ACTE_NAISSANCE', 'DIPLOME_BAC', 'RELEVE_NOTES', 'PHOTO_IDENTITE', 'CNI'];

    /**
     * ADMIN : Liste tous les paiements
     */
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Paiement::with(['etudiant.user', 'concours'])->orderBy('created_at', 'desc')->get()
        ]);
    }

    /**
     * ADMIN : Voir un paiement spécifique
     */
    public function show($id)
    {
        $paiement = Paiement::with(['etudiant.user'])->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $paiement
        ]);
    }

    /**
     * ETUDIANT : Soumettre un paiement
     */
    public function store(Request $request)
    {
        $etudiant = Etudiant::where('user_id', auth()->id())->first();

        if (!$etudiant) {
            return response()->json([
                'message' => 'Vous devez d\'abord créer votre profil étudiant.'
            ], 404);
        }

        // Get active enrollement's concours_id from session or latest enrollement
        $concoursId = session('active_concours_id');
        
        if (!$concoursId) {
            // Fallback: get the latest enrollement's concours_id
            $activeEnrollement = Enrollement::where('etudiant_id', $etudiant->id)
                ->orderBy('created_at', 'desc')
                ->first();
            $concoursId = $activeEnrollement ? $activeEnrollement->concours_id : $etudiant->concours_id;
        }

        // Vérifier si un paiement en attente ou validé existe déjà pour ce concours
        $existingPaiement = Paiement::where('etudiant_id', $etudiant->id)
            ->where('concours_id', $concoursId)
            ->whereIn('statut', ['EN_ATTENTE', 'VALIDE'])
            ->first();

        if ($existingPaiement) {
            return response()->json([
                'message' => 'Vous avez déjà un paiement ' . strtolower($existingPaiement->statut) . ' pour ce concours.',
                'paiement' => $existingPaiement
            ], 409);
        }

        $validated = $request->validate([
            'montant' => 'required|numeric|min:0',
            'mode_paiement' => 'required|string|in:Orange Money,MTN Mobile Money,Virement,Espèces',
            'date_paiement' => 'required|date',
            'reference_transaction' => 'nullable|string|max:100',
            'preuve_paiement' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        // Upload de la preuve de paiement
        $preuvePath = null;
        if ($request->hasFile('preuve_paiement')) {
            $preuvePath = $request->file('preuve_paiement')->store('preuves_paiement', 'public');
        }

        $paiement = Paiement::create([
            'montant' => $validated['montant'],
            'mode_paiement' => $validated['mode_paiement'],
            'date_paiement' => $validated['date_paiement'],
            'reference_transaction' => $validated['reference_transaction'] ?? null,
            'preuve_paiement' => $preuvePath,
            'etudiant_id' => $etudiant->id,
            'concours_id' => $concoursId,
            'statut' => 'EN_ATTENTE'
        ]);

        return response()->json([
            'message' => 'Paiement soumis avec succès. En attente de validation.',
            'paiement' => $paiement
        ], 201);
    }

    /**
     * ADMIN : Valider un paiement
     * - Vérifie que tous les documents sont validés
     * - Crée automatiquement l'enrôlement
     * - Envoie une notification WhatsApp à l'étudiant
     */
    public function valider(Request $request, $id)
    {
        $paiement = Paiement::with(['etudiant.user', 'etudiant.filiere', 'etudiant.niveau', 'etudiant.departement', 'concours'])->findOrFail($id);
        $etudiant = $paiement->etudiant;

        // Vérifier que tous les documents requis sont validés pour ce concours
        $documentsValides = Document::where('etudiant_id', $etudiant->id)
            ->where('concours_id', $paiement->concours_id)
            ->where('statut', 'VALIDE')
            ->pluck('type_document')
            ->toArray();

        $documentsManquants = array_diff(self::REQUIRED_DOCUMENTS, $documentsValides);

        if (!empty($documentsManquants)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de valider le paiement. Documents non validés pour ce concours : ' . implode(', ', $documentsManquants)
            ], 400);
        }

        // Valider le paiement
        $paiement->update(['statut' => 'VALIDE']);

        // Créer automatiquement l'enrôlement pour ce concours spécifique
        $enrollement = Enrollement::updateOrCreate(
            [
                'etudiant_id' => $etudiant->id,
                'concours_id' => $paiement->concours_id  // IMPORTANT : lier au concours du paiement
            ],
            [
                'filiere_id' => $etudiant->filiere_id,
                'niveau_id' => $etudiant->niveau_id,
                'departement_id' => $etudiant->departement_id ?? null,
                'centre_depot_id' => $etudiant->centre_depot_id ?? 1,
                'annee_academique' => date('Y') . '-' . (date('Y') + 1),
                'date_enrolement' => now()->format('Y-m-d'),
                'statut' => 'VALIDE'
            ]
        );

        // Créer une notification en base de données
        \App\Models\Notification::create([
            'user_id' => $etudiant->user_id,
            'type' => 'PAIEMENT_VALIDE',
            'titre' => '✅ Paiement validé',
            'message' => "Félicitations ! Votre paiement a été validé et votre enrôlement est confirmé. Matricule: {$etudiant->matricule}. Vous pouvez télécharger votre fiche d'enrôlement.",
            'data' => [
                'paiement_id' => $paiement->id_paiement,
                'montant' => $paiement->montant,
                'matricule' => $etudiant->matricule
            ]
        ]);

        // Envoyer notification WhatsApp
        $this->sendWhatsAppNotification(
            $etudiant->user->telephone ?? null,
            "✅ Félicitations {$etudiant->user->prenom} ! Votre enrôlement a été VALIDÉ. " .
            "Matricule: {$etudiant->matricule}. " .
            "Connectez-vous pour télécharger votre fiche d'enrôlement."
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Paiement validé et enrôlement créé avec succès',
            'paiement' => $paiement->fresh()->load('etudiant.user'),
            'enrollement' => $enrollement
        ]);
    }

    /**
     * ADMIN : Rejeter un paiement
     */
    public function rejeter(Request $request, $id)
    {
        $paiement = Paiement::with('etudiant.user')->findOrFail($id);

        $request->validate([
            'motif_rejet' => 'nullable|string|max:500'
        ]);

        $motif = $request->motif_rejet ?? 'Aucun motif spécifié';

        $paiement->update([
            'statut' => 'REJETE',
            'motif_rejet' => $motif
        ]);

        // Créer une notification en base de données
        $etudiant = $paiement->etudiant;
        if ($etudiant && $etudiant->user) {
            \App\Models\Notification::create([
                'user_id' => $etudiant->user_id,
                'type' => 'PAIEMENT_REJETE',
                'titre' => '❌ Paiement rejeté',
                'message' => "Votre paiement a été rejeté. Motif: {$motif}. Veuillez soumettre un nouveau paiement avec les corrections nécessaires.",
                'data' => [
                    'paiement_id' => $paiement->id_paiement,
                    'motif_rejet' => $motif
                ]
            ]);
        }

        // Envoyer notification WhatsApp
        $this->sendWhatsAppNotification(
            $etudiant->user->telephone ?? null,
            "❌ Votre paiement a été REJETÉ. " .
            "Motif: {$motif}. " .
            "Veuillez vous connecter pour plus de détails et soumettre un nouveau paiement."
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Paiement rejeté',
            'paiement' => $paiement
        ]);
    }

    /**
     * Envoyer une notification WhatsApp via API
     */
    private function sendWhatsAppNotification($telephone, $message)
    {
        if (!$telephone) {
            Log::warning('Pas de numéro de téléphone pour la notification WhatsApp');
            return false;
        }

        try {
            // Option 1: Utiliser CallMeBot (gratuit, simple)
            $apiUrl = "https://api.callmebot.com/whatsapp.php";
            $response = Http::get($apiUrl, [
                'phone' => $telephone,
                'text' => $message,
                'apikey' => env('CALLMEBOT_API_KEY', '')
            ]);

            Log::info('Notification WhatsApp envoyée', [
                'telephone' => $telephone,
                'status' => $response->status()
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Erreur envoi WhatsApp: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * ETUDIANT : Récupérer son propre paiement
     */
    public function myPaiement(Request $request)
    {
        $etudiant = Etudiant::where('user_id', auth()->id())->first();

        if (!$etudiant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil étudiant introuvable.',
                'data' => null
            ], 404);
        }

        // Get concours_id from query parameter, session, or latest enrollement
        $concoursId = $request->query('concours_id') ?? session('active_concours_id');
        
        if (!$concoursId) {
            // Fallback: get the latest enrollement's concours_id
            $activeEnrollement = Enrollement::where('etudiant_id', $etudiant->id)
                ->orderBy('created_at', 'desc')
                ->first();
            $concoursId = $activeEnrollement ? $activeEnrollement->concours_id : null;
        }

        $query = Paiement::where('etudiant_id', $etudiant->id);
        
        // Filter by concours_id if available
        if ($concoursId) {
            $query->where('concours_id', $concoursId);
        }
        
        $paiement = $query->orderBy('created_at', 'desc')->first();

        return response()->json([
            'status' => 'success',
            'data' => $paiement
        ]);
    }
}
