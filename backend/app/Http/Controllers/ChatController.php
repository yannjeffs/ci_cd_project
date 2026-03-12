<?php

namespace App\Http\Controllers;

use App\Services\ChatService;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    protected $chatService;

    public function __construct(ChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    /**
     * Envoyer un message au chatbot (utilisateur connecté)
     */
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:500'
        ]);

        $userId = auth()->id();
        $message = $validated['message'];

        // Traiter le message
        $response = $this->chatService->processMessage($message, $userId);

        return response()->json([
            'status' => 'success',
            'message' => $response['message'],
            'suggestions' => $response['suggestions'] ?? []
        ]);
    }

    /**
     * Envoyer un message au chatbot (utilisateur non connecté)
     */
    public function sendPublicMessage(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:500'
        ]);

        $message = $validated['message'];

        // Traiter le message sans userId
        $response = $this->chatService->processMessage($message, null);

        return response()->json([
            'status' => 'success',
            'message' => $response['message'],
            'suggestions' => $response['suggestions'] ?? []
        ]);
    }

    /**
     * Récupérer l'historique de conversation
     */
    public function getHistory(Request $request)
    {
        $userId = auth()->id();
        $history = $this->chatService->getHistory($userId);

        return response()->json([
            'status' => 'success',
            'history' => $history
        ]);
    }

    /**
     * Obtenir des suggestions de questions
     */
    public function getSuggestions(Request $request)
    {
        $userId = auth()->id();
        $suggestions = $this->chatService->generateSuggestions($userId);

        return response()->json([
            'status' => 'success',
            'suggestions' => $suggestions
        ]);
    }
}
