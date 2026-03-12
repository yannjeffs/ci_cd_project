<?php

namespace App\Mail;

use App\Models\Enrollement;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EnrollementValidatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $enrollement;
    public $pdfUrl;

    public function __construct(Enrollement $enrollement)
    {
        $this->enrollement = $enrollement;
        $this->pdfUrl = route('enrollements.pdf', $enrollement->id);
    }

    public function build()
    {
        return $this->subject('SGEE - Votre enrôlement a été validé !')
                    ->view('emails.enrollement-validated');
    }
}
