<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Mail\LoginConfirmationMail;
use App\Mail\VerificationMail;
use App\Mail\PasswordResetMail;
use App\Jobs\SendEmailJob;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
        ]);

        // Récupérer le rôle ETUDIANT par défaut
        $roleEtudiant = Role::where('nom_role', 'ETUDIANT')->first();

        if (!$roleEtudiant) {
            return response()->json([
                'message' => 'Erreur de configuration : rôle ETUDIANT introuvable.'
            ], 500);
        }

        $user = User::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'telephone' => $validated['telephone'] ?? null,
            'adresse' => $validated['adresse'] ?? null,
            'role_id' => $roleEtudiant->id,
            'email_verified_at' => null, // Email non vérifié par défaut
        ]);

        // Générer un code de vérification à 6 chiffres
        $code = $user->generateVerificationCode();

        // ✅ Envoi asynchrone via queue (on passe la classe + params pour éviter la sérialisation d'un modèle)
        try {
            SendEmailJob::dispatch(VerificationMail::class, $user->email, [$user->id, $code]);
        } catch (\Exception $e) {
            Log::error("Erreur dispatch email vérification : " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Inscription réussie ! Un code de vérification a été envoyé à votre email.',
            'requires_verification' => true,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
            ]
        ], 201);
    }

    /**
     * Vérification de l'email avec code à 6 chiffres
     */
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Code invalide'], 404);
        }

        // Vérifier si déjà vérifié
        if ($user->isVerified()) {
            return response()->json(['message' => 'Email déjà vérifié'], 200);
        }

        // Vérifier le code
        $hashedCode = hash('sha256', $request->code);
        if ($user->email_verification_token !== $hashedCode) {
            return response()->json(['message' => 'Code invalide'], 400);
        }

        // Vérifier l'expiration (15 minutes)
        if (!$user->email_verification_sent_at || $user->email_verification_sent_at->addMinutes(15)->isPast()) {
            return response()->json([
                'message' => 'Code expiré, demandez un nouveau code',
                'expired' => true
            ], 400);
        }

        // Marquer comme vérifié
        $user->markEmailAsVerified();

        return response()->json([
            'message' => 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.'
        ], 200);
    }

    /**
     * Renvoyer l'email de vérification
     */
    public function resendVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Sécurité : ne pas révéler si l'email existe
            return response()->json(['message' => 'Si cet email existe, un lien de vérification a été envoyé.'], 200);
        }

        if ($user->isVerified()) {
            return response()->json(['message' => 'Email déjà vérifié'], 200);
        }

        // Générer nouveau code et envoyer
        $code = $user->generateVerificationCode();

        // ✅ Envoi asynchrone via queue (classe + params)
        try {
            SendEmailJob::dispatch(VerificationMail::class, $user->email, [$user->id, $code]);
        } catch (\Exception $e) {
            Log::error("Erreur dispatch email vérification : " . $e->getMessage());
        }

        return response()->json(['message' => 'Un nouveau code de vérification a été envoyé.'], 200);
    }

    /**
     * Connexion utilisateur
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::with(['role', 'etudiant'])->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        // Vérifier si l'email est vérifié
        if (!$user->isVerified()) {
            // Renvoyer un nouveau code
            $code = $user->generateVerificationCode();

            // ✅ Envoi asynchrone via queue (classe + params)
            try {
                SendEmailJob::dispatch(VerificationMail::class, $user->email, [$user->id, $code]);
            } catch (\Exception $e) {
                Log::error("Erreur dispatch email vérification : " . $e->getMessage());
            }

            return response()->json([
                'message' => 'Veuillez vérifier votre email. Un nouveau code de vérification a été envoyé.',
                'requires_verification' => true,
                'email' => $user->email
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // ✅ Envoi asynchrone via queue (classe + params)
        try {
            SendEmailJob::dispatch(LoginConfirmationMail::class, $user->email, [$user->id]);
        } catch (\Exception $e) {
            Log::error("Erreur dispatch email connexion : " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Connexion réussie',
            'token' => $token,
            'user' => $user
        ], 200);
    }

    /**
     * Mot de passe oublié
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Toujours retourner succès (sécurité anti-énumération)
        if (!$user) {
            return response()->json([
                'message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.'
            ], 200);
        }

        // Supprimer les anciens tokens
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Créer nouveau token
        $token = Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => hash('sha256', $token),
            'created_at' => now(),
        ]);

        // ✅ Envoi asynchrone via queue (classe + params)
        try {
            SendEmailJob::dispatch(PasswordResetMail::class, $user->email, [$request->email, $token]);
        } catch (\Exception $e) {
            Log::error("Erreur dispatch email reset : " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.'
        ], 200);
    }

    /**
     * Réinitialiser le mot de passe
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // Vérifier le token
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json(['message' => 'Lien invalide ou expiré'], 400);
        }

        // Vérifier le hash du token
        if (hash('sha256', $request->token) !== $resetRecord->token) {
            return response()->json(['message' => 'Lien invalide ou expiré'], 400);
        }

        // Vérifier l'expiration (60 minutes)
        $createdAt = \Carbon\Carbon::parse($resetRecord->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Lien expiré, veuillez en demander un nouveau'], 400);
        }

        // Mettre à jour le mot de passe
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Supprimer le token utilisé
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
        ], 200);
    }

    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès']);
    }
}
