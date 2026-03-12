<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QrToken extends Model {
    protected $fillable = ['token', 'user_id', 'expires_at', 'status'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function isActive(): bool {
        return $this->status === 'ACTIF' && ($this->expires_at === null || now()->lessThan($this->expires_at));
    }
}
