<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Prometheus\CollectorRegistry;
use Prometheus\RenderTextFormat;
use Prometheus\Storage\InMemory;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/metrics', function () {
    // On utilise InMemory mais on injecte les vraies valeurs DB
    $registry = new CollectorRegistry(new InMemory());

    $registry->getOrRegisterGauge(
        'app', 'active_users_total', 'Utilisateurs actifs'
    )->set(\App\Models\User::count());

    $registry->getOrRegisterGauge(
        'app', 'queued_jobs_total', 'Jobs en attente'
    )->set(DB::table('jobs')->count());

    $registry->getOrRegisterGauge(
        'app', 'http_requests_total', 'Requêtes HTTP'
    )->set(0);

    $registry->getOrRegisterGauge(
        'app', 'app_errors_total', 'Erreurs applicatives'
    )->set(0);

    $renderer = new RenderTextFormat();
    $output = $renderer->render($registry->getMetricFamilySamples());

    return response($output, 200)
        ->header('Content-Type', RenderTextFormat::MIME_TYPE);
});
