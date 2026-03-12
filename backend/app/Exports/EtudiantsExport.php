<?php

namespace App\Exports;

use App\Models\Etudiant;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EtudiantsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $departementId;
    protected $filiereId;

    public function __construct($departementId = null, $filiereId = null)
    {
        $this->departementId = $departementId;
        $this->filiereId = $filiereId;
    }

    /**
     * Récupérer la collection d'étudiants à exporter
     */
    /**
     * Récupérer la collection d'étudiants à exporter
     */
    public function collection()
    {
        $query = Etudiant::with(['user', 'filiere', 'niveau', 'departement', 'concours', 'centreDepot', 'centreExamen']);

        if ($this->departementId) {
            $query->where('departement_id', $this->departementId);
        }

        if ($this->filiereId) {
            $query->where('filiere_id', $this->filiereId);
        }

        return $query->orderBy('matricule')->get();
    }

    /**
     * Définir les en-têtes de colonnes
     */
    public function headings(): array
    {
        return [
            'Matricule',
            'Nom',
            'Prénom',
            'Email',
            'Téléphone',
            'Département',
            'Filière',
            'Niveau',
            'Centre de Dépôt',
            'Centre d\'Examen',
            'Date Naissance',
            'Sexe',
            'Adresse',
            'Concours',
            'Date Inscription'
        ];
    }

    /**
     * Mapper les données de chaque étudiant
     */
    public function map($etudiant): array
    {
        return [
            $etudiant->matricule ?? 'N/A',
            $etudiant->user->nom ?? 'N/A',
            $etudiant->user->prenom ?? 'N/A',
            $etudiant->user->email ?? 'N/A',
            $etudiant->telephone ?? $etudiant->user->telephone ?? 'N/A',
            $etudiant->departement->nom ?? 'N/A',
            $etudiant->filiere->nom ?? 'N/A',
            $etudiant->niveau->nom ?? 'N/A',
            $etudiant->centreDepot->nom ?? 'N/A',
            $etudiant->centreExamen->nom ?? 'N/A',
            $etudiant->date_naissance ? \Carbon\Carbon::parse($etudiant->date_naissance)->format('d/m/Y') : 'N/A',
            $etudiant->sexe ?? 'N/A',
            $etudiant->adresse ?? 'N/A',
            $etudiant->concours->nom ?? 'N/A',
            $etudiant->date_inscription ? \Carbon\Carbon::parse($etudiant->date_inscription)->format('d/m/Y') : 'N/A'
        ];
    }

    /**
     * Appliquer des styles au tableau
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style pour la ligne d'en-tête
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
