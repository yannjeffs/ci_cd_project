<?php

namespace App\Console\Commands;

use App\Metrics\AppMetrics;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdatePrometheusGauges extends Command
{
    protected $signature = 'prometheus:update-gauges';
    protected $description = 'Met à jour les métriques gauge de Prometheus';

    public function handle(): void
    {
        // Nombre d'utilisateurs connectés (sessions actives)
        $activeUsers = DB::table('sessions')
            ->where('last_activity', '>', now()->subMinutes(5)->timestamp)
            ->count();

        AppMetrics::activeUsers()->set($activeUsers, []);

        // Nombre de jobs en queue
        $queuedJobs = DB::table('jobs')->count();
        AppMetrics::queuedJobs()->set($queuedJobs, []);

        $this->info('Gauges Prometheus mises à jour avec succès.');
    }
}
