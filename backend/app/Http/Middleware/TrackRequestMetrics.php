<?php

namespace App\Http\Middleware;

use App\Metrics\AppMetrics;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackRequestMetrics
{
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);

        $response = $next($request);

        $duration = microtime(true) - $startTime;
        $route = $request->route()?->getName() ?? $request->path();
        $method = $request->method();
        $statusCode = (string) $response->getStatusCode();

        // Incrémenter le compteur de requêtes
        AppMetrics::httpRequestsTotal()
            ->inc([$method, $route, $statusCode]);

        // Enregistrer la durée
        AppMetrics::httpRequestDuration()
            ->observe($duration, [$method, $route]);

        // Compter les erreurs
        if ((int) $statusCode >= 500) {
            AppMetrics::appErrors()
                ->inc(['http_500']);
        }

        return $response;
    }
}
