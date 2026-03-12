<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $verificationCode;

    public function __construct(User $user, string $code)
    {
        $this->user = $user;
        $this->verificationCode = $code;
    }

    public function build()
    {
        return $this->subject('SGEE - Code de vérification')
                    ->view('emails.verification');
    }
}
