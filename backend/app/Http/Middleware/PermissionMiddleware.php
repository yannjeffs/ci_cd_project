<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PermissionMiddleware
{
    public function handle(Request $request, Closure $next, $permission)
    {
        $user = Auth::user();

        if (!$user || !$user->role) {
            return response()->json(['message' => 'Utilisateur ou rôle introuvable'], 403);
        }

        // Vérifie si le rôle a la permission demandée
        $hasPermission = $user->role->permissions->pluck('nom_permission')->contains($permission);

        if (!$hasPermission) {
            return response()->json(['message' => 'Permission refusée'], 403);
        }

        return $next($request);
    }
}
