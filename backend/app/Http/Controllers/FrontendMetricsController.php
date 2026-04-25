<?php

namespace App\Http\Controllers;

use App\Metrics\AppMetrics;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Prometheus\CollectorRegistry;

class FrontendMetricsController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'metric_name' => 'required|string|in:CLS,FCP,INP,LCP,TTFB',
            'metric_value' => 'required|numeric',
            'rating' => 'required|string|in:good,needs-improvement,poor',
            'page' => 'required|string|max:255',
        ]);

        app(CollectorRegistry::class)
            ->getOrRegisterHistogram(
                namespace: 'app',
                name: 'frontend_web_vitals',
                help: 'Web Vitals du frontend React',
                labels: ['metric', 'page', 'rating'],
                buckets: [10, 50, 100, 200, 500, 1000, 2500, 5000, 10000]
            )
            ->observe(
                $validated['metric_value'],
                [
                    $validated['metric_name'],
                    $validated['page'],
                    $validated['rating'],
                ]
            );

        return response()->json(['status' => 'ok']);
    }
}
