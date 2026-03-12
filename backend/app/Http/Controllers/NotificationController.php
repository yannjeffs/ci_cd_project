<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * ÉTUDIANT : Récupérer toutes les notifications de l'utilisateur connecté (paginées)
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $perPage = min($perPage, 100); // Maximum 100 par page
        
        // ✅ Eager load la relation user si nécessaire
        $notifications = auth()->user()->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $notifications->items(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total()
            ]
        ]);
    }

    /**
     * ÉTUDIANT : Récupérer uniquement le compteur de notifications non lues
     */
    public function unreadCount()
    {
        $count = auth()->user()->notifications()
            ->where('lue', false)
            ->count();

        return response()->json([
            'status' => 'success',
            'count' => $count
        ]);
    }

    /**
     * ÉTUDIANT : Récupérer uniquement les notifications non lues
     */
    public function unread()
    {
        $notifications = auth()->user()->notifications()
            ->unread()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $notifications,
            'count' => $notifications->count()
        ]);
    }

    /**
     * ÉTUDIANT : Marquer une notification comme lue
     */
    public function markAsRead($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json([
            'status' => 'success',
            'message' => 'Notification marquée comme lue',
            'data' => $notification
        ]);
    }

    /**
     * ÉTUDIANT : Marquer toutes les notifications comme lues
     */
    public function markAllAsRead()
    {
        $updated = auth()->user()->notifications()
            ->unread()
            ->update(['lue' => true]);

        return response()->json([
            'status' => 'success',
            'message' => 'Toutes les notifications ont été marquées comme lues',
            'count' => $updated
        ]);
    }

    /**
     * ÉTUDIANT : Supprimer une notification
     */
    public function destroy($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $notification->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Notification supprimée'
        ]);
    }
}
