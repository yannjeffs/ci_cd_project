<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\{Concours, Departement, Filiere, User, Document, Paiement, Enrollement, Niveau, CentreDepot, CentreExamen};

class ChatService
{
    protected $openaiApiKey;
    protected $model;
    protected $apiUrl;

    public function __construct()
    {
        $this->openaiApiKey = config('services.openai.api_key');
        $this->model = config('services.openai.model', 'llama-3.1-70b-versatile');
        $this->apiUrl = config('services.openai.api_url', 'https://api.groq.com/openai/v1/chat/completions');
    }

    /**
     * Traiter un message utilisateur
     */
    public function processMessage(string $message, ?int $userId = null): array
    {
        // Vérifier si on a une clé API
        if (empty($this->openaiApiKey)) {
            return [
                'message' => "Le chatbot n'est pas encore configuré. Veuillez ajouter votre clé API Groq dans le fichier .env (OPENAI_API_KEY=votre-clé)",
                'suggestions' => $this->generateSuggestions($userId)
            ];
        }

        // 1. Vérifier le cache pour les réponses fréquentes
        $cachedResponse = $this->getCachedResponse($message);
        if ($cachedResponse) {
            return [
                'message' => $cachedResponse,
                'suggestions' => $this->generateSuggestions($userId)
            ];
        }

        // 2. Construire le contexte
        $context = $this->buildContext($userId);

        // 3. Préparer le prompt système
        $systemPrompt = $this->getSystemPrompt($context);

        // 4. Appeler OpenAI
        $response = $this->callOpenAI($systemPrompt, $message);

        // 5. Logger la conversation
        $this->logConversation($userId, $message, $response);

        return [
            'message' => $response,
            'suggestions' => $this->generateSuggestions($userId)
        ];
    }

    /**
     * Construire le contexte utilisateur
     */
    protected function buildContext(?int $userId): array
    {
        $context = [
            'concours_ouverts' => Concours::where('statut', 'OUVERT')
                ->select('nom', 'code', 'description', 'date_debut_inscription', 'date_fin_inscription', 'date_concours', 'frais_inscription', 'ville', 'conditions')
                ->get(),
            'filieres' => Filiere::select('nom', 'code_filiere')->get(),
            'departements' => Departement::select('nom', 'description')->get(),
            'niveaux' => Niveau::select('nom')->get(),
            'centres_depot' => CentreDepot::select('nom', 'region', 'adresse')->get(),
            'centres_examen' => CentreExamen::select('nom', 'adresse')->get(),
        ];

        if ($userId) {
            $user = User::with(['etudiant'])->find($userId);
            if ($user && $user->etudiant) {
                $etudiantId = $user->etudiant->id;
                
                $documents = Document::where('etudiant_id', $etudiantId)
                    ->select('type_document', 'statut')
                    ->get();
                
                $paiement = Paiement::where('etudiant_id', $etudiantId)
                    ->select('montant', 'statut', 'date_paiement')
                    ->first();
                
                $enrollement = Enrollement::where('etudiant_id', $etudiantId)
                    ->select('statut', 'date_enrolement')
                    ->first();

                $context['user'] = [
                    'nom' => $user->nom,
                    'prenom' => $user->prenom,
                    'documents_count' => $documents->count(),
                    'documents_valides' => $documents->where('statut', 'VALIDE')->count(),
                    'documents_rejetes' => $documents->where('statut', 'REJETE')->count(),
                    'paiement_statut' => $paiement ? $paiement->statut : 'NON_EFFECTUE',
                    'enrollement_statut' => $enrollement ? $enrollement->statut : 'NON_EFFECTUE',
                ];
            }
        }

        return $context;
    }

    /**
     * Générer le prompt système
     */
    protected function getSystemPrompt(array $context): string
    {
        $prompt = "Tu es un assistant virtuel pour le Système de Gestion des Enrôlements Étudiants (SGEE) du Cameroun. ";
        $prompt .= "Tu aides les candidats avec leurs questions sur les concours, inscriptions et procédures.\n\n";

        // Ajouter les données disponibles
        $prompt .= "=== CONCOURS OUVERTS ===\n";
        if ($context['concours_ouverts']->isEmpty()) {
            $prompt .= "Aucun concours ouvert actuellement.\n";
        } else {
            foreach ($context['concours_ouverts'] as $concours) {
                $prompt .= "• {$concours->nom} (Code: {$concours->code})\n";
                if ($concours->description) {
                    $prompt .= "  Description: {$concours->description}\n";
                }
                $prompt .= "  Période d'inscription: du {$concours->date_debut_inscription} au {$concours->date_fin_inscription}\n";
                $prompt .= "  Date du concours: {$concours->date_concours}\n";
                $prompt .= "  Frais d'inscription: {$concours->frais_inscription} FCFA\n";
                if ($concours->ville) {
                    $prompt .= "  Ville: {$concours->ville}\n";
                }
                if ($concours->conditions) {
                    $prompt .= "  Conditions: {$concours->conditions}\n";
                }
                $prompt .= "\n";
            }
        }

        $prompt .= "=== FILIÈRES DISPONIBLES ===\n";
        foreach ($context['filieres'] as $filiere) {
            $prompt .= "• {$filiere->nom} (Code: {$filiere->code_filiere})\n";
        }

        $prompt .= "\n=== DÉPARTEMENTS/ÉCOLES ===\n";
        foreach ($context['departements'] as $dept) {
            $prompt .= "• {$dept->nom}";
            if ($dept->description) {
                $prompt .= " - {$dept->description}";
            }
            $prompt .= "\n";
        }

        $prompt .= "\n=== CENTRES DE DÉPÔT ===\n";
        foreach ($context['centres_depot'] as $centre) {
            $prompt .= "• {$centre->nom} - {$centre->region}";
            if ($centre->adresse) {
                $prompt .= " ({$centre->adresse})";
            }
            $prompt .= "\n";
        }

        $prompt .= "\n=== CENTRES D'EXAMEN ===\n";
        foreach ($context['centres_examen'] as $centre) {
            $prompt .= "• {$centre->nom}";
            if ($centre->adresse) {
                $prompt .= " - {$centre->adresse}";
            }
            $prompt .= "\n";
        }

        // Ajouter le contexte utilisateur si connecté
        if (isset($context['user'])) {
            $user = $context['user'];
            $prompt .= "\n=== INFORMATIONS DU CANDIDAT ===\n";
            $prompt .= "Nom: {$user['prenom']} {$user['nom']}\n";
            $prompt .= "Documents uploadés: {$user['documents_count']}/5\n";
            $prompt .= "Documents validés: {$user['documents_valides']}\n";
            if ($user['documents_rejetes'] > 0) {
                $prompt .= "Documents rejetés: {$user['documents_rejetes']} (à remplacer)\n";
            }
            $prompt .= "Statut paiement: {$user['paiement_statut']}\n";
            $prompt .= "Statut enrôlement: {$user['enrollement_statut']}\n";
        }

        $prompt .= "\n=== INSTRUCTIONS ===\n";
        $prompt .= "• Réponds TOUJOURS en français\n";
        $prompt .= "• Sois clair, concis et professionnel\n";
        $prompt .= "• Utilise les données ci-dessus pour répondre précisément\n";
        $prompt .= "• Si tu ne sais pas, dis-le honnêtement et suggère de contacter le support\n";
        $prompt .= "• Sois amical et encourageant\n";
        $prompt .= "• Pour les questions sur le processus: Inscription → Documents (5 requis) → Paiement → Enrôlement\n";
        $prompt .= "• Documents requis: Acte de naissance, Diplôme BAC, Relevé de notes, Photo d'identité, CNI\n";
        $prompt .= "• Formats acceptés: PDF, JPG, PNG (max 10MB)\n";

        return $prompt;
    }

    /**
     * Appeler l'API Groq (compatible OpenAI)
     */
    protected function callOpenAI(string $systemPrompt, string $userMessage): string
    {
        try {
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development
            ])->withHeaders([
                'Authorization' => 'Bearer ' . $this->openaiApiKey,
                'Content-Type' => 'application/json',
            ])->timeout(15)->post($this->apiUrl, [
                'model' => $this->model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userMessage]
                ],
                'temperature' => 0.7,
                'max_tokens' => 500
            ]);

            if ($response->successful()) {
                $message = $response->json()['choices'][0]['message']['content'];
                return $message;
            }

            Log::error('Groq API Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            
            return "Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants ou contacter le support.";

        } catch (\Exception $e) {
            Log::error('Groq Exception', ['error' => $e->getMessage()]);
            return "Désolé, je ne peux pas répondre pour le moment. Veuillez contacter le support à support@sgee.cm";
        }
    }

    /**
     * Vérifier le cache pour les questions fréquentes
     */
    protected function getCachedResponse(string $message): ?string
    {
        $normalizedMessage = strtolower(trim($message));
        
        $frequentQuestions = [
            'bonjour' => "Bonjour! 👋 Je suis l'assistant virtuel du SGEE. Je peux vous aider avec vos questions sur les concours, les inscriptions, les documents requis, etc. Comment puis-je vous aider aujourd'hui?",
            
            'comment s\'inscrire' => "Pour vous inscrire au concours, suivez ces étapes:\n\n1️⃣ Créez un compte sur la plateforme\n2️⃣ Complétez votre profil étudiant\n3️⃣ Uploadez les 5 documents requis (Acte de naissance, Diplôme BAC, Relevé de notes, Photo d'identité, CNI)\n4️⃣ Effectuez le paiement des frais d'inscription\n5️⃣ Soumettez votre enrôlement\n\nVous recevrez une notification à chaque étape validée!",
            
            'quels documents' => "Vous devez fournir 5 documents obligatoires:\n\n📄 Acte de naissance\n🎓 Diplôme du BAC\n📊 Relevé de notes du BAC\n📷 Photo d'identité récente\n🪪 Carte nationale d'identité (CNI)\n\nFormats acceptés: PDF, JPG, PNG (max 10MB par fichier)",
            
            'combien coûte' => "Les frais d'inscription varient selon le concours choisi. Veuillez consulter les détails du concours spécifique pour connaître le montant exact. Vous pouvez payer par Mobile Money ou virement bancaire.",
        ];
        
        foreach ($frequentQuestions as $pattern => $response) {
            if (str_contains($normalizedMessage, $pattern)) {
                return $response;
            }
        }
        
        return null;
    }

    /**
     * Générer des suggestions contextuelles
     */
    protected function generateSuggestions(?int $userId): array
    {
        $suggestions = [
            "Quelles sont les écoles disponibles?",
            "Comment s'inscrire au concours?",
            "Quels documents dois-je fournir?",
            "Où sont les centres d'examen?",
        ];

        if ($userId) {
            $user = User::with(['etudiant'])->find($userId);
            if ($user && $user->etudiant) {
                $etudiantId = $user->etudiant->id;
                
                // Suggestions personnalisées selon l'état
                $docsCount = Document::where('etudiant_id', $etudiantId)->count();
                if ($docsCount < 5) {
                    $suggestions = [
                        "Quels documents me manquent?",
                        "Comment uploader mes documents?",
                        "Quel format pour les documents?",
                        "Où en est ma candidature?",
                    ];
                } else {
                    $paiement = Paiement::where('etudiant_id', $etudiantId)->first();
                    if (!$paiement || $paiement->statut !== 'VALIDE') {
                        $suggestions = [
                            "Comment effectuer le paiement?",
                            "Combien coûte l'inscription?",
                            "Quand mon paiement sera validé?",
                            "Où en est ma candidature?",
                        ];
                    } else {
                        $suggestions = [
                            "Où en est ma candidature?",
                            "Quand aurai-je ma réponse?",
                            "Comment télécharger ma fiche?",
                            "Où passer l'examen?",
                        ];
                    }
                }
            }
        }

        return array_slice($suggestions, 0, 4);
    }

    /**
     * Logger la conversation
     */
    protected function logConversation(?int $userId, string $message, string $response): void
    {
        Log::info('Chat Conversation', [
            'user_id' => $userId,
            'message' => $message,
            'response' => substr($response, 0, 200), // Limiter la taille du log
            'timestamp' => now()
        ]);
    }

    /**
     * Récupérer l'historique
     */
    public function getHistory(?int $userId): array
    {
        // Pour l'instant, retourner un tableau vide
        // TODO: Implémenter une table chat_history si nécessaire
        return [];
    }
}
