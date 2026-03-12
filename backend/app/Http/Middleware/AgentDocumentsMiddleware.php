<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AgentDocumentsMiddleware
{
    /**
     * Vérifie que l'utilisateur connecté est un agent en charge des documents.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->hasRole('AGENT_DOCUMENTS')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès interdit. Rôle AGENT_DOCUMENTS requis.',
                'debug' => [
                    'user_id' => $user ? $user->id : 'Non connecté',
                    'user_role_actuel' => $user && $user->role ? $user->role->nom_role : 'Aucun rôle'
                ]
            ], 403);
        }

        return $next($request);
    }
}
