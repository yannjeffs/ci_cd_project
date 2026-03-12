<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paiement extends Model {
    protected $primaryKey = 'id_paiement';

    protected $fillable = [
        'montant',
        'date_paiement',
        'mode_paiement',
        'reference_transaction',
        'preuve_paiement',
        'statut',
        'motif_rejet',
        'etudiant_id',
        'concours_id'        // NOUVEAU : Support inscriptions multiples
    ];

    protected $casts = [
        'date_paiement' => 'date',
        'montant' => 'decimal:2'
    ];

    public function etudiant(): BelongsTo {
        return $this->belongsTo(Etudiant::class);
    }

    public function concours(): BelongsTo {
        return $this->belongsTo(Concours::class);
    }

    // Scope pour filtrer par concours
    public function scopeForConcours($query, $concoursId)
    {
        return $query->where('concours_id', $concoursId);
    }
}
