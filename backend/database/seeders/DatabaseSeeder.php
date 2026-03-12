<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
use App\Models\Niveau;
use App\Models\Departement;
use App\Models\CentreDepot;
use App\Models\CentreExamen;
use App\Models\Concours;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Création des Rôles
        $adminRole = Role::firstOrCreate(
            ['nom_role' => 'ADMIN'],
            ['description_role' => 'Gestion totale']
        );

        $etudiantRole = Role::firstOrCreate(
            ['nom_role' => 'ETUDIANT'],
            ['description_role' => 'Accès espace enrôlement']
        );

        // 6. Création des Concours (Écoles)
        $enspy = Concours::firstOrCreate(
            ['code' => 'ENSPY'],
            [
                'nom' => 'École Nationale Supérieure Polytechnique de Yaoundé',
                'description' => 'Concours d\'entrée en 1ère année du cycle des ingénieurs de conception',
                'date_debut_inscription' => '2026-01-01',
                'date_fin_inscription' => '2026-03-31',
                'date_concours' => '2026-05-15',
                'frais_inscription' => 25000,
                'statut' => 'OUVERT',
                'ville' => 'Yaoundé',
                'conditions' => 'Baccalauréat série C, D, E ou F avec mention Bien minimum'
            ]
        );

        $enspt = Concours::firstOrCreate(
            ['code' => 'ENSPT'],
            [
                'nom' => 'École Nationale Supérieure des Postes et Télécommunications',
                'description' => 'Concours d\'entrée en 1ère année - Filières Télécommunications et Informatique',
                'date_debut_inscription' => '2026-01-15',
                'date_fin_inscription' => '2026-04-15',
                'date_concours' => '2026-06-01',
                'frais_inscription' => 20000,
                'statut' => 'OUVERT',
                'ville' => 'Yaoundé',
                'conditions' => 'Baccalauréat série C, D, E ou équivalent'
            ]
        );

        $fgi = Concours::firstOrCreate(
            ['code' => 'FGI-UDS'],
            [
                'nom' => 'Faculté de Génie Industriel - Université de Douala',
                'description' => 'Concours d\'entrée en cycle ingénieur',
                'date_debut_inscription' => '2026-02-01',
                'date_fin_inscription' => '2026-04-30',
                'date_concours' => '2026-06-20',
                'frais_inscription' => 15000,
                'statut' => 'OUVERT',
                'ville' => 'Douala',
                'conditions' => 'Baccalauréat scientifique ou technique'
            ]
        );

        $enset = Concours::firstOrCreate(
            ['code' => 'ENSET-DLA'],
            [
                'nom' => 'École Normale Supérieure de l\'Enseignement Technique de Douala',
                'description' => 'Concours d\'entrée - Formation des enseignants techniques',
                'date_debut_inscription' => '2026-01-10',
                'date_fin_inscription' => '2026-03-20',
                'date_concours' => '2026-05-10',
                'frais_inscription' => 18000,
                'statut' => 'OUVERT',
                'ville' => 'Douala',
                'conditions' => 'Baccalauréat technique ou scientifique'
            ]
        );

        $iut = Concours::firstOrCreate(
            ['code' => 'IUT-FV'],
            [
                'nom' => 'Institut Universitaire de Technologie Fotso Victor de Bandjoun',
                'description' => 'Concours d\'entrée en DUT et Licence Professionnelle',
                'date_debut_inscription' => '2026-02-15',
                'date_fin_inscription' => '2026-05-15',
                'date_concours' => '2026-07-01',
                'frais_inscription' => 12000,
                'statut' => 'OUVERT',
                'ville' => 'Bandjoun',
                'conditions' => 'Baccalauréat toutes séries'
            ]
        );

        $essec = Concours::firstOrCreate(
            ['code' => 'ESSEC'],
            [
                'nom' => 'École Supérieure des Sciences Économiques et Commerciales',
                'description' => 'Concours d\'entrée en 1ère année - Gestion et Commerce',
                'date_debut_inscription' => '2026-01-20',
                'date_fin_inscription' => '2026-04-20',
                'date_concours' => '2026-06-10',
                'frais_inscription' => 22000,
                'statut' => 'OUVERT',
                'ville' => 'Douala',
                'conditions' => 'Baccalauréat série A, B, C, D ou G'
            ]
        );

        // 2. Mise à jour / Création des Départements et Filières pour CHAQUE école

        // --- ENSPY (Polytechnique) ---
        $depInfo = Departement::firstOrCreate(
            ['nom' => 'Génie Informatique', 'concours_id' => $enspy->id],
            ['description' => 'Département de Génie Informatique']
        );
        $depInfo->filieres()->firstOrCreate(['code_filiere' => 'GL-ENSPY'], ['nom' => 'Génie Logiciel']);
        $depInfo->filieres()->firstOrCreate(['code_filiere' => 'SR-ENSPY'], ['nom' => 'Systèmes et Réseaux']);

        $depCivil = Departement::firstOrCreate(
            ['nom' => 'Génie Civil', 'concours_id' => $enspy->id],
            ['description' => 'Département de Génie Civil']
        );
        $depCivil->filieres()->firstOrCreate(['code_filiere' => 'GCI-ENSPY'], ['nom' => 'Génie Civil']);


        // --- ESSEC (Gestion) ---
        $depGestion = Departement::firstOrCreate(
            ['nom' => 'Gestion', 'concours_id' => $essec->id],
            ['description' => 'Département de Gestion']
        );
        $depGestion->filieres()->firstOrCreate(['code_filiere' => 'CF-ESSEC'], ['nom' => 'Comptabilité et Finance']);
        $depGestion->filieres()->firstOrCreate(['code_filiere' => 'MK-ESSEC'], ['nom' => 'Marketing et Commerce']);


        // --- ENSET (Technique) ---
        $depElec = Departement::firstOrCreate(
            ['nom' => 'Génie Électrique', 'concours_id' => $enset->id],
            ['description' => 'Département de Génie Électrique']
        );
        $depElec->filieres()->firstOrCreate(['code_filiere' => 'EL-ENSET'], ['nom' => 'Électronique']);
        $depElec->filieres()->firstOrCreate(['code_filiere' => 'ET-ENSET'], ['nom' => 'Électrotechnique']);

        $depMeca = Departement::firstOrCreate(
            ['nom' => 'Génie Mécanique', 'concours_id' => $enset->id],
            ['description' => 'Département de Génie Mécanique']
        );
        $depMeca->filieres()->firstOrCreate(['code_filiere' => 'CM-ENSET'], ['nom' => 'Construction Mécanique']);
        $depMeca->filieres()->firstOrCreate(['code_filiere' => 'FM-ENSET'], ['nom' => 'Fabrication Mécanique']);


        // --- ENSPT (Postes et Télécoms) ---
        $depTelecom = Departement::firstOrCreate(
            ['nom' => 'Télécommunications', 'concours_id' => $enspt->id],
            ['description' => 'Département des Télécommunications']
        );
        $depTelecom->filieres()->firstOrCreate(['code_filiere' => 'IT-ENSPT'], ['nom' => 'Ingénierie des Télécoms']);

        $depMgt = Departement::firstOrCreate(
            ['nom' => 'Management', 'concours_id' => $enspt->id],
            ['description' => 'Département de Management des P&T']
        );
        $depMgt->filieres()->firstOrCreate(['code_filiere' => 'MPT-ENSPT'], ['nom' => 'Management des Projets Télécoms']);


        // --- FGI (Génie Industriel) ---
        $depTechInd = Departement::firstOrCreate(
            ['nom' => 'Technologie de Construction Industrielle', 'concours_id' => $fgi->id],
            ['description' => 'Département TCI']
        );
        $depTechInd->filieres()->firstOrCreate(['code_filiere' => 'TCI-FGI'], ['nom' => 'Technologie de Construction']);

        $depPeche = Departement::firstOrCreate(
            ['nom' => 'Pêche Industrielle', 'concours_id' => $fgi->id],
            ['description' => 'Département de Pêche']
        );
        $depPeche->filieres()->firstOrCreate(['code_filiere' => 'PI-FGI'], ['nom' => 'Pêche Industrielle']);


        // --- IUT-FV (Bandjoun) ---
        $depInfoIut = Departement::firstOrCreate(
            ['nom' => 'Informatique de Gestion', 'concours_id' => $iut->id],
            ['description' => 'Département Informatique']
        );
        $depInfoIut->filieres()->firstOrCreate(['code_filiere' => 'IG-IUT'], ['nom' => 'Informatique de Gestion']);
        $depInfoIut->filieres()->firstOrCreate(['code_filiere' => 'ABD-IUT'], ['nom' => 'Administrateur de Bases de Données']);

        $depElecIut = Departement::firstOrCreate(
            ['nom' => 'Génie Électrique et Informatique Industrielle', 'concours_id' => $iut->id],
            ['description' => 'Département GEII']
        );
        $depElecIut->filieres()->firstOrCreate(['code_filiere' => 'GEII-IUT'], ['nom' => 'Génie Électrique']);

        // 3. Création des Niveaux
        Niveau::firstOrCreate(['nom' => 'Licence 1'], ['description' => 'Première année']);
        Niveau::firstOrCreate(['nom' => 'Licence 2'], ['description' => 'Deuxième année']);
        Niveau::firstOrCreate(['nom' => 'Licence 3'], ['description' => 'Troisième année']);
        Niveau::firstOrCreate(['nom' => 'Master 1'], ['description' => 'Quatrième année']);
        Niveau::firstOrCreate(['nom' => 'Master 2'], ['description' => 'Cinquième année']);

        // 4. Création des Centres de Dépôt (Régions et villes du Cameroun)
        // Région Centre
        CentreDepot::firstOrCreate(
            ['code' => 'CD-YDE'],
            ['nom' => 'Centre Yaoundé', 'region' => 'Centre', 'statut' => 'ACTIF', 'adresse' => 'Yaoundé, Cameroun']
        );

        // Région Littoral
        CentreDepot::firstOrCreate(
            ['code' => 'CD-DLA'],
            ['nom' => 'Centre Douala', 'region' => 'Littoral', 'statut' => 'ACTIF', 'adresse' => 'Douala, Cameroun']
        );

        // Région Ouest
        CentreDepot::firstOrCreate(
            ['code' => 'CD-BFM'],
            ['nom' => 'Centre Bafoussam', 'region' => 'Ouest', 'statut' => 'ACTIF', 'adresse' => 'Bafoussam, Cameroun']
        );

        CentreDepot::firstOrCreate(
            ['code' => 'CD-BGT'],
            ['nom' => 'Centre Bangangté', 'region' => 'Ouest', 'statut' => 'ACTIF', 'adresse' => 'Bangangté, Cameroun']
        );

        CentreDepot::firstOrCreate(
            ['code' => 'CD-BFG'],
            ['nom' => 'Centre Bafang', 'region' => 'Ouest', 'statut' => 'ACTIF', 'adresse' => 'Bafang, Cameroun']
        );

        CentreDepot::firstOrCreate(
            ['code' => 'CD-BDJ'],
            ['nom' => 'Centre Badjoun', 'region' => 'Ouest', 'statut' => 'ACTIF', 'adresse' => 'Badjoun, Cameroun']
        );

        CentreDepot::firstOrCreate(
            ['code' => 'CD-DSG'],
            ['nom' => 'Centre Dschang', 'region' => 'Ouest', 'statut' => 'ACTIF', 'adresse' => 'Dschang, Cameroun']
        );

        CentreDepot::firstOrCreate(
            ['code' => 'CD-MBD'],
            ['nom' => 'Centre Mbouda', 'region' => 'Ouest', 'statut' => 'ACTIF', 'adresse' => 'Mbouda, Cameroun']
        );

        // Région Nord-Ouest
        CentreDepot::firstOrCreate(
            ['code' => 'CD-BMD'],
            ['nom' => 'Centre Bamenda', 'region' => 'Nord-Ouest', 'statut' => 'ACTIF', 'adresse' => 'Bamenda, Cameroun']
        );

        // Région Sud-Ouest
        CentreDepot::firstOrCreate(
            ['code' => 'CD-BUE'],
            ['nom' => 'Centre Buea', 'region' => 'Sud-Ouest', 'statut' => 'ACTIF', 'adresse' => 'Buea, Cameroun']
        );

        CentreDepot::firstOrCreate(
            ['code' => 'CD-LBE'],
            ['nom' => 'Centre Limbé', 'region' => 'Sud-Ouest', 'statut' => 'ACTIF', 'adresse' => 'Limbé, Cameroun']
        );

        // Région Nord
        CentreDepot::firstOrCreate(
            ['code' => 'CD-GRA'],
            ['nom' => 'Centre Garoua', 'region' => 'Nord', 'statut' => 'ACTIF', 'adresse' => 'Garoua, Cameroun']
        );

        // Région Extrême-Nord
        CentreDepot::firstOrCreate(
            ['code' => 'CD-MRA'],
            ['nom' => 'Centre Maroua', 'region' => 'Extrême-Nord', 'statut' => 'ACTIF', 'adresse' => 'Maroua, Cameroun']
        );

        // Région Adamaoua
        CentreDepot::firstOrCreate(
            ['code' => 'CD-NGA'],
            ['nom' => 'Centre Ngaoundéré', 'region' => 'Adamaoua', 'statut' => 'ACTIF', 'adresse' => 'Ngaoundéré, Cameroun']
        );

        // Région Est
        CentreDepot::firstOrCreate(
            ['code' => 'CD-BTA'],
            ['nom' => 'Centre Bertoua', 'region' => 'Est', 'statut' => 'ACTIF', 'adresse' => 'Bertoua, Cameroun']
        );

        // Région Sud
        CentreDepot::firstOrCreate(
            ['code' => 'CD-EBW'],
            ['nom' => 'Centre Ebolowa', 'region' => 'Sud', 'statut' => 'ACTIF', 'adresse' => 'Ebolowa, Cameroun']
        );

        CentreDepot::firstOrCreate(
            ['code' => 'CD-KRI'],
            ['nom' => 'Centre Kribi', 'region' => 'Sud', 'statut' => 'ACTIF', 'adresse' => 'Kribi, Cameroun']
        );

        // 5. Création des Centres d'Examen (Grandes villes uniquement)
        CentreExamen::firstOrCreate(
            ['code' => 'CE-YDE-1'],
            ['nom' => 'Lycée Général Leclerc - Yaoundé', 'capacite' => 500, 'statut' => 'ACTIF', 'adresse' => 'Yaoundé Centre']
        );

        CentreExamen::firstOrCreate(
            ['code' => 'CE-YDE-2'],
            ['nom' => 'Université de Yaoundé I', 'capacite' => 1000, 'statut' => 'ACTIF', 'adresse' => 'Ngoa-Ekelle, Yaoundé']
        );

        CentreExamen::firstOrCreate(
            ['code' => 'CE-YDE-3'],
            ['nom' => 'Lycée de Nkol-Eton - Yaoundé', 'capacite' => 400, 'statut' => 'ACTIF', 'adresse' => 'Nkol-Eton, Yaoundé']
        );

        CentreExamen::firstOrCreate(
            ['code' => 'CE-DLA-1'],
            ['nom' => 'Lycée Joss - Douala', 'capacite' => 600, 'statut' => 'ACTIF', 'adresse' => 'Akwa, Douala']
        );

        CentreExamen::firstOrCreate(
            ['code' => 'CE-DLA-2'],
            ['nom' => 'Université de Douala', 'capacite' => 800, 'statut' => 'ACTIF', 'adresse' => 'Logbessou, Douala']
        );

        CentreExamen::firstOrCreate(
            ['code' => 'CE-DLA-3'],
            ['nom' => 'Lycée Bilingue de Deido - Douala', 'capacite' => 450, 'statut' => 'ACTIF', 'adresse' => 'Deido, Douala']
        );

        CentreExamen::firstOrCreate(
            ['code' => 'CE-BFM-1'],
            ['nom' => 'Lycée Classique de Bafoussam', 'capacite' => 400, 'statut' => 'ACTIF', 'adresse' => 'Bafoussam Centre']
        );

        CentreExamen::firstOrCreate(
            ['code' => 'CE-BFM-2'],
            ['nom' => 'Université de Dschang - Annexe Bafoussam', 'capacite' => 500, 'statut' => 'ACTIF', 'adresse' => 'Bafoussam']
        );

        // Concours (Écoles) déjà créés plus haut pour le liage avec les départements

        // 7. Création d'un utilisateur Admin pour tester
        User::firstOrCreate(
            ['email' => 'admin@sgee.com'],
            [
                'nom' => 'Admin',
                'prenom' => 'System',
                'password' => Hash::make('password123'),
                'role_id' => $adminRole->id,
                'telephone' => '+237600000000',
                'email_verified_at' => now()
            ]
        );

        // 7. Création d'un utilisateur Étudiant de test
        User::firstOrCreate(
            ['email' => 'etudiant@test.com'],
            [
                'nom' => 'Dupont',
                'prenom' => 'Jean',
                'password' => Hash::make('password123'),
                'role_id' => $etudiantRole->id,
                'telephone' => '+237699999999',
                'email_verified_at' => now()
            ]
        );

        // Appeler le seeder des permissions
        $this->call(RolePermissionSeeder::class);

        // 8. Création d'un utilisateur Agent Documents de test
        $agentRole = \App\Models\Role::where('nom_role', 'AGENT_DOCUMENTS')->first();
        if ($agentRole) {
            User::firstOrCreate(
                ['email' => 'agent@service.com'],
                [
                    'nom' => 'Agent',
                    'prenom' => 'Documents',
                    'password' => Hash::make('password123'),
                    'role_id' => $agentRole->id,
                    'telephone' => '+237688888888',
                    'email_verified_at' => now()
                ]
            );
        }
    }
}
