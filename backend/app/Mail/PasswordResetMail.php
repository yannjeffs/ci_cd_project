<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $email;
    public $token;
    public $resetUrl;
    public $expiresAt;

    public function __construct(string $email, string $token)
    {
        $this->email = $email;
        $this->token = $token;
        $this->resetUrl = config('app.frontend_url', 'http://localhost:5173') . '/reset-password?token=' . $token . '&email=' . urlencode($email);
        $this->expiresAt = now()->addMinutes(60);
    }

    public function build()
    {
        return $this->subject('SGEE - Réinitialisation de votre mot de passe')
                    ->view('emails.password-reset');
    }
}
