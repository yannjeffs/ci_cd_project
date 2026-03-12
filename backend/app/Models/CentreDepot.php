<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CentreDepot extends Model
{
    protected $table = 'centre_depots';
    protected $primaryKey = 'id_centre_depot';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = ['nom', 'code', 'statut', 'region', 'adresse'];

    // Relation : un centre de dépôt peut avoir plusieurs enrollements
    public function enrollements()
    {
        return $this->hasMany(Enrollement::class, 'centre_depot_id', 'id_centre_depot');
    }
}
