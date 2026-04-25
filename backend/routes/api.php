<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController,
    EtudiantController,
    DepartementController,
    FiliereController,
    NiveauController,
    PaiementController,
    DocumentController,
    CentreDepotController,
    CentreExamenController,
    EnrollementController,
    ConcoursController,
    FrontendMetricsController
};

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- 1. ROUTES PUBLIQUES ---
Route::post('/metrics/frontend', [FrontendMetricsController::class, 'store']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Vérification email
Route::post('/email/verify', [AuthController::class, 'verifyEmail']);
Route::post('/email/resend', [AuthController::class, 'resendVerification']);

// Reset password
Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

// --- DONNÉES DE RÉFÉRENCE (Publiques pour les formulaires) ---
Route::get('/filieres', [FiliereController::class, 'index']);
Route::get('/niveaux', [NiveauController::class, 'index']);
Route::get('/centre-depots', [CentreDepotController::class, 'index']);
Route::get('/centre-examens', [CentreExamenController::class, 'index']);
Route::get('/departements', [DepartementController::class, 'index']);
Route::get('/departements/{id}/filieres', [DepartementController::class, 'getFilieres']);
Route::get('/departements/{id}/etudiants', [DepartementController::class, 'getEtudiants']);

// --- CONCOURS (Publiques - pour le choix initial de l'école) ---
Route::get('/concours', [ConcoursController::class, 'index']);
Route::get('/concours/ouverts', [ConcoursController::class, 'ouverts']);
Route::get('/concours/{id}', [ConcoursController::class, 'show']);

// Chatbot (utilisateurs non connectés)
Route::post('/chat/public', [\App\Http\Controllers\ChatController::class, 'sendPublicMessage']);

// --- 2. ROUTES PROTÉGÉES (Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {

    // Profil & Déconnexion
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', function (Request $request) {
        return $request->user()->load(['role', 'etudiant.filiere', 'etudiant.niveau', 'etudiant.departement', 'etudiant.centreDepot', 'etudiant.centreExamen', 'etudiant.concours']);
    });

    // Chatbot (utilisateurs connectés)
    Route::post('/chat', [\App\Http\Controllers\ChatController::class, 'sendMessage']);
    Route::get('/chat/history', [\App\Http\Controllers\ChatController::class, 'getHistory']);
    Route::get('/chat/suggestions', [\App\Http\Controllers\ChatController::class, 'getSuggestions']);

    // --- 3. ESPACE ÉTUDIANT (Rôle ETUDIANT uniquement) ---
    // Notifications (Pour tous les utilisateurs authentifiés)
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount']);
    Route::get('/notifications/unread', [\App\Http\Controllers\NotificationController::class, 'unread']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy']);

    // --- 3. ESPACE ÉTUDIANT (Rôle ETUDIANT uniquement) ---
    Route::middleware('role:ETUDIANT')->group(function () {
        Route::post('/etudiants/register-profile', [EtudiantController::class, 'store']);
        Route::post('/paiements/submit', [PaiementController::class, 'store']);
        Route::post('/enrollements/submit', [EnrollementController::class, 'store']);
        Route::post('/documents/upload', [DocumentController::class, 'store']);
        Route::get('/my-documents', [DocumentController::class, 'myDocuments']);
        Route::get('/my-paiement', [PaiementController::class, 'myPaiement']);
        Route::get('/my-enrollement', [EnrollementController::class, 'myEnrollement']);

        // NOUVEAU : Gestion des inscriptions multiples
        Route::get('/my-enrollements', [EnrollementController::class, 'myEnrollements']);
        Route::post('/enrollements/create', [EnrollementController::class, 'createEnrollement']);
        Route::put('/enrollements/{id}/set-active', [EnrollementController::class, 'setActive']);

        // Téléchargement de la fiche PDF
        Route::get('/enrollements/{id}/pdf', [EnrollementController::class, 'genererFiche']);
    });

    // --- 4. ESPACE CENTRE DE DÉPÔT (Rôle CENTRE_DEPOT uniquement) ---
    Route::middleware(['role:CENTRE_DEPOT', 'centre_depot'])->group(function () {
        Route::get('/centre/documents', [DocumentController::class, 'indexCentre']);
        Route::patch('/centre/documents/{id}/valider', [DocumentController::class, 'validerCentre']);
    });

    // --- 4.5 ESPACE AGENT DOCUMENTS (Rôle AGENT_DOCUMENTS uniquement) ---
    Route::middleware(['role:AGENT_DOCUMENTS', 'agent_documents'])->group(function () {
        Route::get('/agent/documents', [\App\Http\Controllers\AgentDocumentsController::class, 'getPendingDocuments']);
        Route::get('/agent/documents/archived', [\App\Http\Controllers\AgentDocumentsController::class, 'getArchivedDocuments']);
        Route::post('/agent/documents/{id}/validate', [\App\Http\Controllers\AgentDocumentsController::class, 'validateDocument']);
        Route::post('/agent/documents/{id}/reject', [\App\Http\Controllers\AgentDocumentsController::class, 'rejectDocument']);
        Route::get('/agent/stats', [\App\Http\Controllers\AgentDocumentsController::class, 'getStats']);
    });

    // --- 5. ESPACE ADMINISTRATION (Rôle ADMIN uniquement) ---
    Route::middleware('role:ADMIN')->group(function () {

        // --- ACTIONS DE VALIDATION ---
        // Valider un paiement
        Route::post('/paiements/{id}/valider', [PaiementController::class, 'valider']);
        // Rejeter un paiement
        Route::post('/paiements/{id}/rejeter', [PaiementController::class, 'rejeter']);
        // Valider/Rejeter un enrôlement (Statut: VALIDE, REJETE)
        Route::patch('/enrollements/{id}/statut', [EnrollementController::class, 'updateStatut']);
        // Valider/Rejeter un document (Statut: VALIDE, REJETE)
        Route::patch('/documents/{id}/valider', [DocumentController::class, 'valider']);
        // Valider tous les documents d'un étudiant
        Route::post('/documents/valider-tous/{etudiantId}', [DocumentController::class, 'validerTousDocuments']);

        // --- DOCUMENTS GROUPÉS PAR CONCOURS (comme l'agent) ---
        Route::get('/admin/documents/by-concours', [\App\Http\Controllers\AdminDocumentsController::class, 'getDocumentsByConcours']);

        // --- GESTION DES RESSOURCES (CRUD) ---
        Route::apiResource('etudiants', EtudiantController::class);
        Route::apiResource('departements', DepartementController::class)->except(['index']);
        Route::apiResource('filieres', FiliereController::class)->except(['index']);
        Route::apiResource('niveaux', NiveauController::class)->except(['index']);
        Route::apiResource('centre-depots', CentreDepotController::class)->except(['index']);
        Route::apiResource('centre-examens', CentreExamenController::class)->except(['index']);
        Route::apiResource('concours', ConcoursController::class)->except(['index', 'show']);

        // Export PDF des étudiants par département
        Route::get('/departements/{id}/export-etudiants', [DepartementController::class, 'exportEtudiants']);

        // Consultation globale
        Route::apiResource('paiements', PaiementController::class)->only(['index', 'show']);
        Route::apiResource('enrollements', EnrollementController::class)->only(['index', 'show', 'destroy']);
        Route::apiResource('documents', DocumentController::class);
    });
});
