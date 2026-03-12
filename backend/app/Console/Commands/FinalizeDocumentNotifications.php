<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NotificationService;

class FinalizeDocumentNotifications extends Command
{
    protected $signature = 'notifications:finalize-documents';
    protected $description = 'Finalise les notifications de documents groupées après 5 minutes d\'inactivité';

    public function handle()
    {
        $service = new NotificationService();
        $service->finalizeDocumentNotifications();
        
        $this->info('Notifications de documents finalisées avec succès.');
        return 0;
    }
}
