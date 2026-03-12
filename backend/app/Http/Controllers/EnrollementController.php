<?php

namespace App\Http\Controllers;

use App\Models\Enrollement;
use App\Models\Paiement;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Jobs\SendEmailJob;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class EnrollementController extends Controller
{
    /**
     * Liste tous les enrôlements (Espace Admin)
     */
    public function index()
    {
        // On récupère les enrôlements avec toutes les infos utiles pour l'admin
        return Enrollement::with(['etudiant.user', 'filiere', 'niveau', 'centreDepot'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Enregistrer un nouvel enrôlement (Espace Étudiant)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'etudiant_id'      => 'required|exists:etudiants,id',
            'filiere_id'       => 'required|exists:filieres,id',
            'niveau_id'        => 'required|exists:niveaux,id',
            'centre_depot_id'  => 'required|exists:centre_depots,id_centre_depot',
            'annee_academique' => 'required|string',
        ]);

        $paiementValide = Paiement::where('etudiant_id', $validated['etudiant_id'])
                                   ->where('statut', 'VALIDE')
                                   ->exists();

        if (!$paiementValide) {
            return response()->json(['message' => 'Impossible de s\'enrôler : aucun paiement validé.'], 403);
        }

        $enrollement = Enrollement::create([
            'etudiant_id'      => $validated['etudiant_id'],
            'filiere_id'       => $validated['filiere_id'],
            'niveau_id'        => $validated['niveau_id'],
            'centre_depot_id'  => $validated['centre_depot_id'],
            'annee_academique' => $validated['annee_academique'],
            'date_enrolement'  => now()->format('Y-m-d'),
            'statut'           => 'COMPLET',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => '🎉 Félicitations ! Votre enrôlement a été soumis avec succès. Votre dossier est maintenant en cours de traitement par notre administration. Vous recevrez une notification dès que votre enrôlement sera validé.',
            'enrollement' => $enrollement->load(['etudiant', 'filiere', 'niveau', 'centreDepot'])
        ], 201);
    }

    /**
     * Changer le statut d'un enrôlement (Espace Admin)
     */
    public function updateStatut(Request $request, $id)
    {
        $validated = $request->validate([
            'statut' => 'required|in:COMPLET,VALIDE,REJETE'
        ]);

        $enrollement = Enrollement::with('etudiant.user')->findOrFail($id);
        $ancienStatut = $enrollement->statut;
        $enrollement->update(['statut' => $validated['statut']]);

        // Envoyer un email si le statut passe à VALIDE
        if ($validated['statut'] === 'VALIDE' && $ancienStatut !== 'VALIDE') {
            if ($enrollement->etudiant && $enrollement->etudiant->user) {
                // ✅ Envoi asynchrone via queue (classe + params)
                try {
                    SendEmailJob::dispatch(\App\Mail\EnrollementValidatedMail::class, $enrollement->etudiant->user->email, [$enrollement->id]);
                } catch (\Exception $e) {
                    Log::error("Erreur dispatch email validation enrôlement : " . $e->getMessage());
                }
            }

            // Créer aussi une notification dans l'application
            \App\Models\Notification::create([
                'user_id' => $enrollement->etudiant->user_id,
                'type' => 'ENROLLEMENT_VALIDE',
                'titre' => '🎉 Enrôlement validé !',
                'message' => "Félicitations ! Votre enrôlement a été validé. Vous pouvez maintenant télécharger votre fiche d'enrôlement.",
                'lue' => false,
                'data' => [
                    'enrollement_id' => $enrollement->id,
                    'statut' => 'VALIDE'
                ]
            ]);
        }

        return response()->json([
            'message' => 'Le statut du dossier a été mis à jour : ' . $validated['statut'],
            'enrollement' => $enrollement
        ]);
    }

    /**
     * Générer la fiche d'enrôlement PDF
     */
    public function genererFiche($id)
    {
        $enrollement = Enrollement::with([
            'etudiant.user',
            'etudiant.departement',
            'etudiant.centreExamen',
            'etudiant.concours',
            'filiere',
            'niveau',
            'centreDepot'
        ])->findOrFail($id);

        $donneesQr = "SGEE|ID:" . $enrollement->id . "|MAT:" . $enrollement->etudiant->matricule . "|" . $enrollement->etudiant->user->nom;
        $qrcode = base64_encode(QrCode::format('svg')->size(120)->generate($donneesQr));

        $data = [
            'enrollement' => $enrollement,
            'qrcode'      => $qrcode,
            'date'        => now()->format('d/m/Y H:i')
        ];

        $pdf = Pdf::loadView('pdf.enrollement', $data);
        return $pdf->stream("Fiche_Enrollement_{$enrollement->etudiant->matricule}.pdf");
    }

    /**
     * ETUDIANT : Récupérer son propre enrôlement
     */
    public function myEnrollement()
    {
        $etudiant = \App\Models\Etudiant::where('user_id', auth()->id())->first();

        if (!$etudiant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil étudiant introuvable.',
                'data' => null
            ], 404);
        }

        // Get active enrollement's concours_id from session or latest enrollement
        $concoursId = session('active_concours_id');

        $query = Enrollement::where('etudiant_id', $etudiant->id)
            ->with(['filiere', 'niveau', 'centreDepot', 'concours', 'departement']);

        // Filter by concours_id if available
        if ($concoursId) {
            $query->where('concours_id', $concoursId);
        }

        $enrollement = $query->orderBy('created_at', 'desc')->first();

        return response()->json([
            'status' => 'success',
            'data' => $enrollement
        ]);
    }

    /**
     * NOUVEAU : Liste tous les enrôlements de l'étudiant connecté
     */
    public function myEnrollements()
    {
        $etudiant = \App\Models\Etudiant::where('user_id', auth()->id())->first();

        if (!$etudiant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil étudiant introuvable.'
            ], 404);
        }

        $enrollements = Enrollement::where('etudiant_id', $etudiant->id)
            ->with(['concours', 'departement', 'filiere', 'niveau', 'centreDepot'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $enrollements
        ]);
    }

    /**
     * NOUVEAU : Créer un nouvel enrôlement pour un concours spécifique
     */
    public function createEnrollement(Request $request)
    {
        $etudiant = \App\Models\Etudiant::where('user_id', auth()->id())->first();

        if (!$etudiant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil étudiant introuvable.'
            ], 404);
        }

        $validated = $request->validate([
            'concours_id' => 'required|exists:concours,id',
            'departement_id' => 'required|exists:departements,id',
            'filiere_id' => 'required|exists:filieres,id',
            'niveau_id' => 'required|exists:niveaux,id',
            'centre_depot_id' => 'required|exists:centre_depots,id_centre_depot',
            'copy_documents_from' => 'nullable|exists:enrollements,id',
            'document_types' => 'nullable|array'
        ]);

        // Vérifier que le concours est ouvert
        $concours = \App\Models\Concours::find($validated['concours_id']);
        if (!$concours || !$concours->isOpen()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ce concours n\'est pas ouvert aux inscriptions.'
            ], 400);
        }

        // Vérifier qu'il n'y a pas déjà un enrôlement pour ce concours
        $existing = Enrollement::where('etudiant_id', $etudiant->id)
                               ->where('concours_id', $validated['concours_id'])
                               ->first();

        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous êtes déjà inscrit à ce concours.',
                'enrollement' => $existing->load(['concours', 'departement', 'filiere'])
            ], 409);
        }

        // Créer l'enrôlement
        $enrollement = Enrollement::create([
            'etudiant_id' => $etudiant->id,
            'concours_id' => $validated['concours_id'],
            'departement_id' => $validated['departement_id'],
            'filiere_id' => $validated['filiere_id'],
            'niveau_id' => $validated['niveau_id'],
            'centre_depot_id' => $validated['centre_depot_id'],
            'annee_academique' => now()->year . '-' . (now()->year + 1),
            'date_enrolement' => now(),
            'statut' => 'EN_ATTENTE'
        ]);

        // Copier les documents si demandé
        if ($request->copy_documents_from) {
            $this->copyDocuments(
                $request->copy_documents_from,
                $enrollement->id,
                $request->document_types ?? []
            );
        }

        // Définir comme concours actif
        session(['active_concours_id' => $validated['concours_id']]);
        session(['active_enrollement_id' => $enrollement->id]);

        // Créer une notification
        \App\Models\Notification::create([
            'user_id' => auth()->id(),
            'type' => 'ENROLLEMENT_CREE',
            'titre' => '✅ Nouvelle inscription créée',
            'message' => "Votre inscription au concours {$concours->nom} a été créée avec succès. Veuillez compléter votre dossier (documents et paiement).",
            'lue' => false,
            'data' => [
                'enrollement_id' => $enrollement->id,
                'concours_id' => $concours->id
            ]
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Inscription créée avec succès !',
            'enrollement' => $enrollement->load(['concours', 'departement', 'filiere', 'niveau', 'centreDepot'])
        ], 201);
    }

    /**
     * NOUVEAU : Définir un enrôlement comme actif
     */
    public function setActive($id)
    {
        $etudiant = \App\Models\Etudiant::where('user_id', auth()->id())->first();

        if (!$etudiant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil étudiant introuvable.'
            ], 404);
        }

        $enrollement = Enrollement::where('id', $id)
                                  ->where('etudiant_id', $etudiant->id)
                                  ->firstOrFail();

        session(['active_concours_id' => $enrollement->concours_id]);
        session(['active_enrollement_id' => $enrollement->id]);

        return response()->json([
            'status' => 'success',
            'message' => 'Concours actif mis à jour',
            'enrollement' => $enrollement->load(['concours', 'departement', 'filiere'])
        ]);
    }

    /**
     * NOUVEAU : Copier les documents d'un enrôlement vers un autre
     */
    private function copyDocuments(int $sourceEnrollementId, int $targetEnrollementId, array $documentTypes = [])
    {
        $sourceEnrollement = Enrollement::findOrFail($sourceEnrollementId);
        $targetEnrollement = Enrollement::findOrFail($targetEnrollementId);

        $query = \App\Models\Document::where('etudiant_id', $sourceEnrollement->etudiant_id)
                     ->where('concours_id', $sourceEnrollement->concours_id);

        if (!empty($documentTypes)) {
            $query->whereIn('type_document', $documentTypes);
        }

        $documents = $query->get();

        foreach ($documents as $doc) {
            // Copier le fichier
            $oldPath = $doc->fichier_path;
            if (Storage::exists($oldPath)) {
                $extension = pathinfo($oldPath, PATHINFO_EXTENSION);
                $newFilename = uniqid() . '.' . $extension;
                $newPath = 'documents/' . $newFilename;

                Storage::copy($oldPath, $newPath);

                // Créer nouvelle entrée
                \App\Models\Document::create([
                    'etudiant_id' => $targetEnrollement->etudiant_id,
                    'concours_id' => $targetEnrollement->concours_id,
                    'type_document' => $doc->type_document,
                    'fichier_path' => $newPath,
                    'statut' => 'EN_ATTENTE',
                    'date_televersement' => now()
                ]);
            }
        }
    }
}
