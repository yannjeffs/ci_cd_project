<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Créer les rôles (en MAJUSCULES pour correspondre au middleware)
        $admin = Role::firstOrCreate(
            ['nom_role' => 'ADMIN'],
            ['description_role' => 'Administrateur avec tous les droits']
        );

        $etudiant = Role::firstOrCreate(
            ['nom_role' => 'ETUDIANT'],
            ['description_role' => 'Étudiant avec accès limité']
        );

        // Créer les permissions
        $validerPaiement = Permission::firstOrCreate(
            ['nom_permission' => 'valider_paiement'],
            ['description' => 'Autorise la validation des paiements']
        );

        $voirDocument = Permission::firstOrCreate(
            ['nom_permission' => 'voir_document'],
            ['description' => 'Autorise la consultation des documents']
        );

        $gererEtudiants = Permission::firstOrCreate(
            ['nom_permission' => 'gerer_etudiants'],
            ['description' => 'Autorise la gestion des étudiants']
        );

        $gererFilieres = Permission::firstOrCreate(
            ['nom_permission' => 'gerer_filieres'],
            ['description' => 'Autorise la gestion des filières']
        );

        // Associer les permissions aux rôles
        $admin->permissions()->syncWithoutDetaching([
            $validerPaiement->id_permission,
            $voirDocument->id_permission,
            $gererEtudiants->id_permission,
            $gererFilieres->id_permission
        ]);

        $etudiant->permissions()->syncWithoutDetaching([
            $voirDocument->id_permission
        ]);

        // Rôle Agent Documents
        $agentDocuments = Role::firstOrCreate(
            ['nom_role' => 'AGENT_DOCUMENTS'],
            ['description_role' => "Agent chargé de vérifier/valider les documents des étudiants"]
        );

        $validerDocument = Permission::firstOrCreate(
            ['nom_permission' => 'valider_document'],
            ['description' => 'Autorise la validation ou le rejet des documents']
        );

        // Associer les permissions à l'agent
        $agentDocuments->permissions()->syncWithoutDetaching([
            $voirDocument->id_permission,
            $validerDocument->id_permission
        ]);
    }
}
