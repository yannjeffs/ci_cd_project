<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Gère une requête entrante.
     * * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $role (Le rôle attendu, ex: ADMIN ou ETUDIANT)
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. On vérifie si l'utilisateur est connecté via Sanctum
        // 2. On appelle la méthode hasRole() du modèle User
        if (!$request->user() || !$request->user()->hasRole($role)) {

            return response()->json([
                'status' => 'error',
                'message' => 'Accès interdit. Rôle ' . $role . ' requis pour cette action.',
                'debug' => [
                    'user_id' => $request->user() ? $request->user()->id : 'Non connecté',
                    'user_role_actuel' => $request->user() && $request->user()->role ? $request->user()->role->nom_role : 'Aucun rôle'
                ]
            ], 403);
        }

        return $next($request);
    }
}
