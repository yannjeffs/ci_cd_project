<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class HealthController extends Controller
{
    public function check(): JsonResponse
    {
        $checks = [];
        $status = 'ok';

        // Vérification DB
        try {
            DB::connection()->getPdo();
            $checks['database'] = 'ok';
        } catch (\Exception $e) {
            $checks['database'] = 'error';
            $status = 'degraded';
        }

        // Vérification Cache
        try {
            Cache::put('health_check', true, 10);
            $checks['cache'] = Cache::get('health_check') ? 'ok' : 'error';
        } catch (\Exception $e) {
            $checks['cache'] = 'error';
            $status = 'degraded';
        }

        $httpCode = $status === 'ok' ? 200 : 503;

        return response()->json([
            'status'  => $status,
            'checks'  => $checks,
            'version' => config('app.version', '1.0.0'),
            'env'     => config('app.env'),
        ], $httpCode);
    }
}
