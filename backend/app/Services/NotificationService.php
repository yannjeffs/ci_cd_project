<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Notifier les agents et admins de nouveaux documents de manière intelligente
     */
    public function notifyNewDocument($etudiant, $documentType)
    {
        $etudiantNom = $etudiant->user->prenom . ' ' . $etudiant->user->nom;
        $etudiantId = $etudiant->id;
        
        // Récupérer tous les agents et admins
        $recipients = User::whereHas('role', function($q) {
            $q->whereIn('nom_role', ['ADMIN', 'AGENT_DOCUMENTS']);
        })->get();

        foreach ($recipients as $recipient) {
            // Chercher une notification récente (moins de 5 minutes) pour cet étudiant
            $recentNotification = Notification::where('user_id', $recipient->id)
                ->where('type', 'NOUVEAU_DOCUMENT_BATCH')
                ->where('created_at', '>', Carbon::now()->subMinutes(5))
                ->get()
                ->first(function($notif) use ($etudiantId) {
                    $data = json_decode($notif->data, true);
                    return isset($data['etudiant_id']) && $data['etudiant_id'] == $etudiantId;
                });

            if ($recentNotification) {
                // Mettre à jour la notification existante
                $data = json_decode($recentNotification->data, true);
                $data['count'] = ($data['count'] ?? 1) + 1;
                $data['documents'][] = $documentType;
                $data['last_document_at'] = now()->toDateTimeString();

                $recentNotification->update([
                    'message' => "{$etudiantNom} a soumis {$data['count']} document(s) pour vérification",
                    'data' => json_encode($data),
                    'lue' => false, // Remettre comme non lue
                    'updated_at' => now()
                ]);
            } else {
                // Créer une nouvelle notification
                Notification::create([
                    'user_id' => $recipient->id,
                    'type' => 'NOUVEAU_DOCUMENT_BATCH',
                    'titre' => '📄 Nouveaux documents à vérifier',
                    'message' => "{$etudiantNom} a commencé à soumettre des documents",
                    'lue' => false,
                    'data' => json_encode([
                        'etudiant_id' => $etudiantId,
                        'etudiant_nom' => $etudiantNom,
                        'count' => 1,
                        'documents' => [$documentType],
                        'first_document_at' => now()->toDateTimeString(),
                        'last_document_at' => now()->toDateTimeString(),
                        'finalized' => false
                    ])
                ]);
            }
        }
    }

    /**
     * Finaliser les notifications de documents (appelé par un job planifié)
     */
    public function finalizeDocumentNotifications()
    {
        // Trouver toutes les notifications de batch qui n'ont pas été mises à jour depuis 5 minutes
        $oldNotifications = Notification::where('type', 'NOUVEAU_DOCUMENT_BATCH')
            ->where('updated_at', '<', Carbon::now()->subMinutes(5))
            ->get()
            ->filter(function($notif) {
                $data = json_decode($notif->data, true);
                return !isset($data['finalized']) || $data['finalized'] === false;
            });

        foreach ($oldNotifications as $notification) {
            $data = json_decode($notification->data, true);
            
            // ✅ Gérer le cas où $data est NULL
            if (!is_array($data)) {
                $data = [];
            }
            
            $count = $data['count'] ?? 1;
            $etudiantNom = $data['etudiant_nom'] ?? 'Un étudiant';

            // Mettre à jour avec le message final
            $notification->update([
                'titre' => '✅ Documents soumis',
                'message' => "{$etudiantNom} a soumis {$count} document(s) au total",
                'data' => json_encode(array_merge($data, ['finalized' => true]))
            ]);
        }
    }
}
