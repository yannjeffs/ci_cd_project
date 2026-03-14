<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Etudiant;
use App\Models\Document;
use Illuminate\Support\Facades\Hash;

class AgentDocumentsTest extends TestCase
{
    use RefreshDatabase;

    public function test_agent_can_fetch_pending_documents()
    {
        // Créer le rôle et l'agent
        $role = Role::firstOrCreate(['nom_role' => 'AGENT_DOCUMENTS'], ['description_role' => 'Agent documents']);
        $agent = User::create([
            'nom' => 'Agent',
            'prenom' => 'Test',
            'email' => 'agent_test@example.com',
            'password' => Hash::make('password123'),
            'role_id' => $role->id,
            'telephone' => '+237600000001',
            'email_verified_at' => now()
        ]);

        // Créer un étudiant et un document en attente
        $studentRole = Role::firstOrCreate(['nom_role' => 'ETUDIANT'], ['description_role' => 'Étudiant']);
        $studentUser = User::create([
            'nom' => 'Etudiant',
            'prenom' => 'Test',
            'email' => 'etudiant_test@example.com',
            'password' => Hash::make('password123'),
            'role_id' => $studentRole->id,
            'telephone' => '+237677777777',
            'email_verified_at' => now()
        ]);
        $niveau = \App\Models\Niveau::firstOrCreate(['nom' => 'Niveau Test'], ['code' => 'NT']);
        $departement = \App\Models\Departement::firstOrCreate(['nom' => 'Departement Test']);
        $filiere = \App\Models\Filiere::firstOrCreate(['nom' => 'Filiere Test', 'code_filiere' => 'FT', 'departement_id' => $departement->id]);
        $etudiant = Etudiant::create([
            'matricule' => 'M'.uniqid(),
            'sexe' => 'M',
            'adresse' => 'Adresse test',
            'date_naissance' => '2000-01-01',
            'date_inscription' => now(),
            'user_id' => $studentUser->id,
            'niveau_id' => $niveau->id,
            'filiere_id' => $filiere->id
        ]);
        $document = Document::create([
            'etudiant_id' => $etudiant->id,
            'type_document' => 'DIPLOME_BAC',
            'fichier_path' => 'documents/test.pdf',
            'date_televersement' => now(),
            'statut' => 'EN_ATTENTE',
            'departement_id' => 1
        ]);

        $response = $this->actingAs($agent, 'sanctum')->getJson('/api/agent/documents');
        $response->assertStatus(200);
        $this->assertArrayHasKey('data', $response->json());
    }

    public function test_agent_can_validate_and_reject_document()
    {
        $role = Role::firstOrCreate(['nom_role' => 'AGENT_DOCUMENTS'], ['description_role' => 'Agent documents']);
        $agent = User::create([
            'nom' => 'Agent',
            'prenom' => 'Test2',
            'email' => 'agent_test2@example.com',
            'password' => Hash::make('password123'),
            'role_id' => $role->id,
            'telephone' => '+237600000002',
            'email_verified_at' => now()
        ]);

        $studentRole = Role::firstOrCreate(['nom_role' => 'ETUDIANT'], ['description_role' => 'Étudiant']);
        $studentUser = User::create([
            'nom' => 'Etudiant2',
            'prenom' => 'Test2',
            'email' => 'etudiant_test2@example.com',
            'password' => Hash::make('password123'),
            'role_id' => $studentRole->id,
            'telephone' => '+237677777778',
            'email_verified_at' => now()
        ]);
        $niveau = \App\Models\Niveau::firstOrCreate(['nom' => 'Niveau Test'], ['code' => 'NT']);
        $departement = \App\Models\Departement::firstOrCreate(['nom' => 'Departement Test']);
        $filiere = \App\Models\Filiere::firstOrCreate(['nom' => 'Filiere Test', 'code_filiere' => 'FT', 'departement_id' => $departement->id]);
        $etudiant = Etudiant::create([
            'matricule' => 'M'.uniqid(),
            'sexe' => 'M',
            'adresse' => 'Adresse test',
            'date_naissance' => '2000-01-01',
            'date_inscription' => now(),
            'user_id' => $studentUser->id,
            'niveau_id' => $niveau->id,
            'filiere_id' => $filiere->id
        ]);
        $document = Document::create([
            'etudiant_id' => $etudiant->id,
            'type_document' => 'DIPLOME_BAC',
            'fichier_path' => 'documents/test2.pdf',
            'date_televersement' => now(),
            'statut' => 'EN_ATTENTE',
            'departement_id' => $departement->id
        ]);

        // Valider
        $respVal = $this->actingAs($agent, 'sanctum')->postJson("/api/agent/documents/{$document->id_document}/validate");
        $respVal->assertStatus(200);

        $this->assertDatabaseHas('documents', [
            'id_document' => $document->id_document,
            'statut' => 'VALIDE'
        ]);

        // Rejeter (créer un nouveau document pour le test)
        $doc2 = Document::create([
            'etudiant_id' => $etudiant->id,
            'type_document' => 'RELEVE_NOTES',
            'fichier_path' => 'documents/test3.pdf',
            'date_televersement' => now(),
            'statut' => 'EN_ATTENTE',
            'departement_id' => $departement->id
        ]);

        $respRej = $this->actingAs($agent, 'sanctum')->postJson("/api/agent/documents/{$doc2->id_document}/reject", ['motif_rejet' => 'Incomplet']);
        $respRej->assertStatus(200);

        $this->assertDatabaseHas('documents', [
            'id_document' => $doc2->id_document,
            'statut' => 'REJETE',
            'motif_rejet' => 'Incomplet'
        ]);
    }
}
