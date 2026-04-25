<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class PrometheusAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Authentification Basic Auth
        $user = $request->getUser();
        $password = $request->getPassword();

        $expectedUser = config('prometheus.basic_auth.user', env('PROMETHEUS_AUTH_USER'));
        $expectedPassword = config('prometheus.basic_auth.password', env('PROMETHEUS_AUTH_PASSWORD'));

        if ($user !== $expectedUser || $password !== $expectedPassword) {
            return response('Unauthorized', 401, [
                'WWW-Authenticate' => 'Basic realm="Prometheus Metrics"'
            ]);
        }

        return $next($request);
    }
}
