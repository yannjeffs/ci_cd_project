<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Enrollement;
use App\Mail\VerificationMail;
use App\Mail\LoginConfirmationMail;
use App\Mail\EnrollementValidatedMail;
use App\Mail\PasswordResetMail;

class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3; // Retry 3 fois
    public $timeout = 60; // Timeout après 60s

    protected $mailable; // string class name or Mailable instance
    protected $recipient;
    protected $params = [];

    /**
     * Create a new job instance.
     */
    public function __construct($mailable, $recipient, array $params = [])
    {
        $this->mailable = $mailable;
        $this->recipient = $recipient;
        $this->params = $params;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // If a class name was provided, instantiate the Mailable with params
            $mailable = $this->mailable;
            if (is_string($mailable) && class_exists($mailable)) {
                switch ($mailable) {
                    case VerificationMail::class:
                        $user = User::find($this->params[0] ?? null);
                        $code = $this->params[1] ?? null;
                        $mailable = new VerificationMail($user, $code);
                        break;
                    case LoginConfirmationMail::class:
                        $user = User::find($this->params[0] ?? null);
                        $mailable = new LoginConfirmationMail($user);
                        break;
                    case EnrollementValidatedMail::class:
                        $enrollement = Enrollement::find($this->params[0] ?? null);
                        $mailable = new EnrollementValidatedMail($enrollement);
                        break;
                    case PasswordResetMail::class:
                        $email = $this->params[0] ?? null;
                        $token = $this->params[1] ?? null;
                        $mailable = new PasswordResetMail($email, $token);
                        break;
                    default:
                        // Fallback: try to instantiate with given params
                        $mailable = new $mailable(...$this->params);
                        break;
                }
            }

            Mail::to($this->recipient)->send($mailable);
            Log::info("Email envoyé avec succès à {$this->recipient}");
        } catch (\Exception $e) {
            Log::error("Erreur envoi email à {$this->recipient}: " . $e->getMessage());
            
            // Relancer le job si pas encore atteint le max de tentatives
            if ($this->attempts() < $this->tries) {
                $this->release(60); // Réessayer dans 60 secondes
            }
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Échec définitif envoi email à {$this->recipient}: " . $exception->getMessage());
    }
}
