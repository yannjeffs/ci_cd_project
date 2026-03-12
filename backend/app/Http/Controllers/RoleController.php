<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    //  Liste des rôles
    public function index()
    {
        return response()->json(Role::with('utilisateurs')->get(), 200);
    }

    //  Créer un rôle
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_role' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $role = Role::create($validated);

        return response()->json($role, 201);
    }

    //  Afficher un rôle
    public function show($id)
    {
        $role = Role::with('utilisateurs')->findOrFail($id);
        return response()->json($role, 200);
    }

    //  Modifier un rôle
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'nom_role' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $role->update($validated);

        return response()->json($role, 200);
    }

    //  Supprimer un rôle
    public function destroy($id)
    {
        Role::destroy($id);
        return response()->json(null, 204);
    }
}
