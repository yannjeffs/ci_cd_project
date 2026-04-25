<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Prometheus\CollectorRegistry;
use Prometheus\Storage\APC;
use Prometheus\Storage\InMemory;

class PrometheusMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        try {
            $registry = new CollectorRegistry(new InMemory());

            $counter = $registry->getOrRegisterCounter(
                'app',
                'http_requests_total',
                'Requêtes HTTP totales',
                ['method', 'route', 'status_code']
            );

            $counter->inc([
                $request->method(),
                $request->route()?->getName() ?? $request->path(),
                (string) $response->getStatusCode(),
            ]);
        } catch (\Exception $e) {
            // Ne pas bloquer l'app si Prometheus échoue
        }

        return $response;
    }
}
