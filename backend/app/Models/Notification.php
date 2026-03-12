<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'titre',
        'message',
        'type',
        'lue',
        'data'
    ];

    protected $casts = [
        'lue' => 'boolean',
        'data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relation : Une notification appartient à un utilisateur
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Marque la notification comme lue
     */
    public function markAsRead(): bool
    {
        return $this->update(['lue' => true]);
    }

    /**
     * Marque la notification comme non lue
     */
    public function markAsUnread(): bool
    {
        return $this->update(['lue' => false]);
    }

    /**
     * Scope : Récupère les notifications non lues
     */
    public function scopeUnread($query)
    {
        return $query->where('lue', false);
    }

    /**
     * Scope : Récupère les notifications triées par date (plus récentes en premier)
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}
