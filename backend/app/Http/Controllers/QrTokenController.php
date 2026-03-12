<?php

namespace App\Http\Controllers;

use App\Models\QrToken;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class QrTokenController extends Controller
{
    /**
     * Liste des QR tokens
     */
    public function index()
    {
        return response()->json(QrToken::with('utilisateur')->get(), 200);
    }

    /**
     * Créer un QR token
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'utilisateur_id' => 'required|exists:utilisateurs,id_utilisateur',
            'expires_at' => 'nullable|date',
        ]);

        // ✅ Génération d’un token unique
        $validated['token'] = Str::uuid()->toString();
        $validated['status'] = 'ACTIF';

        $qrToken = QrToken::create($validated);

        return response()->json($qrToken, 201);
    }

    /**
     * Afficher un QR token spécifique
     */
    public function show($id)
    {
        $qrToken = QrToken::with('utilisateur')->findOrFail($id);
        return response()->json($qrToken, 200);
    }

    /**
     * Mettre à jour un QR token
     */
    public function update(Request $request, $id)
    {
        $qrToken = QrToken::findOrFail($id);

        $validated = $request->validate([
            'expires_at' => 'nullable|date',
            'status' => 'nullable|string',
        ]);

        $qrToken->update($validated);

        return response()->json($qrToken, 200);
    }

    /**
     * Supprimer un QR token
     */
    public function destroy($id)
    {
        QrToken::destroy($id);
        return response()->json(null, 204);
    }

    /**
     * Vérifier si un token est valide
     */
    public function verify($token)
    {
        $qrToken = QrToken::where('token', $token)->firstOrFail();

        if ($qrToken->isActive()) {
            return response()->json(['valid' => true, 'message' => 'Token valide'], 200);
        }

        return response()->json(['valid' => false, 'message' => 'Token expiré ou inactif'], 400);
    }
}
