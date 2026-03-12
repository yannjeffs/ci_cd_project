<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Créer un admin de test
        $adminRole = Role::where('nom_role', 'ADMIN')->first();
        if ($adminRole) {
            User::updateOrCreate(
                ['email' => 'admin@test.com'],
                [
                    'nom' => 'Admin',
                    'prenom' => 'Test',
                    'password' => Hash::make('password'),
                    'role_id' => $adminRole->id,
                    'email_verified_at' => now()
                ]
            );
            echo "✓ Admin créé: admin@test.com / password\n";
        }

        // Créer un étudiant de test
        $etudiantRole = Role::where('nom_role', 'ETUDIANT')->first();
        if ($etudiantRole) {
            User::updateOrCreate(
                ['email' => 'etudiant@test.com'],
                [
                    'nom' => 'Etudiant',
                    'prenom' => 'Test',
                    'password' => Hash::make('password'),
                    'role_id' => $etudiantRole->id,
                    'email_verified_at' => now()
                ]
            );
            echo "✓ Etudiant créé: etudiant@test.com / password\n";
        }
    }
}
