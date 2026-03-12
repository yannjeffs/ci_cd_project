<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'role_id',
        'telephone',
        'adresse',
        'email_verified_at',
        'email_verification_token',
        'email_verification_sent_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'email_verification_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'email_verification_sent_at' => 'datetime',
    ];

    /**
     * Vérifie si l'email de l'utilisateur est vérifié
     */
    public function isVerified(): bool
    {
        return $this->email_verified_at !== null;
    }

    /**
     * Génère un code de vérification à 6 chiffres
     */
    public function generateVerificationCode(): string
    {
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->email_verification_token = hash('sha256', $code);
        $this->email_verification_sent_at = now();
        $this->save();
        
        return $code; // Retourne le code pour l'email
    }

    /**
     * Génère un token de vérification unique (ancienne méthode, gardée pour compatibilité)
     */
    public function generateVerificationToken(): string
    {
        $token = Str::random(64);
        $this->email_verification_token = hash('sha256', $token);
        $this->email_verification_sent_at = now();
        $this->save();
        
        return $token; // Retourne le token non-hashé pour l'email
    }

    /**
     * Vérifie si le token de vérification est expiré (24h)
     */
    public function isVerificationTokenExpired(): bool
    {
        if (!$this->email_verification_sent_at) {
            return true;
        }
        return $this->email_verification_sent_at->addHours(24)->isPast();
    }

    /**
     * Marque l'email comme vérifié
     */
    public function markEmailAsVerified(): bool
    {
        return $this->forceFill([
            'email_verified_at' => now(),
            'email_verification_token' => null,
            'email_verification_sent_at' => null,
        ])->save();
    }

    /**
     * Relation : Un utilisateur appartient à un rôle.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Relation : Un utilisateur peut avoir plusieurs documents.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Relation : Un utilisateur peut avoir un profil étudiant.
     */
    public function etudiant(): HasOne
    {
        return $this->hasOne(Etudiant::class);
    }

    /**
     * Relation : Un utilisateur peut avoir plusieurs notifications.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class)->orderBy('created_at', 'desc');
    }

    /**
     * VÉRIFICATION DU RÔLE (Utilisée par le Middleware)
     * Utilise la méthode 'checkNom' définie dans le modèle Role.
     */
    public function hasRole(string $roleNom): bool
    {
        return $this->role && $this->role->checkNom($roleNom);
    }
}
