# Documentation API - Centre Dépôt Validation

## Vue d'ensemble

Cette documentation décrit les endpoints API pour la feature de validation des documents par le centre de dépôt.

## Authentification

Tous les endpoints protégés nécessitent un token Bearer Sanctum:

```
Authorization: Bearer {token}
```

## Endpoints Centre Dépôt

### 1. Récupérer les documents en attente

**Endpoint:** `GET /api/centre-depot/documents`

**Authentification:** Requise (Rôle: CENTRE_DEPOT)

**Permissions:** `documents.view_pending`

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "etudiant": {
        "id": 1,
        "nom": "Dupont",
        "prenom": "Jean",
        "email": "jean@example.com"
      },
      "type_document": "Diplôme",
      "fichier_path": "documents/diploma.pdf",
      "date_televersement": "2025-01-22",
      "statut": "EN_ATTENTE",
      "statut_centre_depot": null
    }
  ],
  "count": 1
}
```

### 2. Valider un document

**Endpoint:** `POST /api/centre-depot/documents/{id}/validate`

**Authentification:** Requise (Rôle: CENTRE_DEPOT)

**Permissions:** `documents.validate`

**Réponse (200):**
```json
{
  "success": true,
  "message": "Document validé avec succès",
  "data": {
    "id": 1,
    "statut_centre_depot": "validé",
    "centre_depot_id": 5,
    "validé_par_centre_depot_at": "2025-01-22T10:30:00Z"
  }
}
```

**Erreurs:**
- `400`: Document déjà traité
- `403`: Permissions insuffisantes
- `404`: Document non trouvé

### 3. Rejeter un document

**Endpoint:** `POST /api/centre-depot/documents/{id}/reject`

**Authentification:** Requise (Rôle: CENTRE_DEPOT)

**Permissions:** `documents.reject`

**Body:**
```json
{
  "motif": "Document illisible et incomplet"
}
```

**Validation:**
- `motif`: Requis, minimum 10 caractères

**Réponse (200):**
```json
{
  "success": true,
  "message": "Document rejeté avec succès",
  "data": {
    "id": 1,
    "statut_centre_depot": "rejeté",
    "motif_rejet_centre_depot": "Document illisible et incomplet",
    "centre_depot_id": 5,
    "validé_par_centre_depot_at": "2025-01-22T10:30:00Z"
  }
}
```

**Erreurs:**
- `400`: Motif invalide (< 10 caractères)
- `400`: Document déjà traité
- `403`: Permissions insuffisantes
- `404`: Document non trouvé

### 4. Récupérer les notifications groupées

**Endpoint:** `GET /api/centre-depot/notifications`

**Authentification:** Requise (Rôle: CENTRE_DEPOT)

**Permissions:** `notifications.view_grouped`

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titre": "Documents en attente",
      "message": "3 documents en attente de validation pour Jean Dupont",
      "type": "info",
      "lue": false,
      "groupé_par": "etudiant",
      "reference_id": 1,
      "count": 3,
      "created_at": "2025-01-22T10:00:00Z"
    }
  ],
  "unread_count": 1
}
```

### 5. Récupérer les documents d'un étudiant

**Endpoint:** `GET /api/centre-depot/students/{id}/documents`

**Authentification:** Requise (Rôle: CENTRE_DEPOT)

**Permissions:** `documents.view_pending`

**Réponse (200):**
```json
{
  "success": true,
  "etudiant": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean"
  },
  "data": [
    {
      "id": 1,
      "type_document": "Diplôme",
      "statut_centre_depot": null,
      "date_televersement": "2025-01-22"
    }
  ],
  "count": 1
}
```

## Endpoints Admin

### 1. Récupérer tous les documents avec statut centre_depot

**Endpoint:** `GET /api/admin/documents`

**Authentification:** Requise (Rôle: ADMIN)

**Réponse (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "etudiant": {
        "id": 1,
        "nom": "Dupont",
        "prenom": "Jean",
        "email": "jean@example.com"
      },
      "type_document": "Diplôme",
      "statut": "EN_ATTENTE",
      "statut_centre_depot": "validé",
      "motif_rejet_centre_depot": null,
      "validé_par_centre_depot_at": "2025-01-22T10:30:00Z",
      "centre_depot": {
        "id": 5,
        "nom": "Centre",
        "prenom": "Dépôt"
      }
    }
  ],
  "count": 1
}
```

### 2. Récupérer l'historique d'un document

**Endpoint:** `GET /api/admin/documents/{id}/history`

**Authentification:** Requise (Rôle: ADMIN)

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": 1,
      "type": "Diplôme",
      "date_televersement": "2025-01-22",
      "statut": "EN_ATTENTE",
      "etudiant": {
        "id": 1,
        "nom": "Dupont",
        "prenom": "Jean",
        "email": "jean@example.com"
      }
    },
    "history": [
      {
        "action": "validé",
        "par": "Centre Dépôt",
        "role": "CENTRE_DEPOT",
        "date": "2025-01-22T10:30:00Z",
        "motif": null,
        "timestamp": 1705929000
      }
    ]
  }
}
```

## Codes d'erreur

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Données invalides ou document déjà traité |
| 401 | Unauthorized | Non authentifié |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Ressource non trouvée |
| 500 | Internal Server Error | Erreur serveur |

## Workflow complet

### Scénario 1: Validation réussie

1. **Étudiant soumet un document**
   - Statut: `EN_ATTENTE`
   - `statut_centre_depot`: `null`

2. **Centre Dépôt valide**
   - `POST /api/centre-depot/documents/{id}/validate`
   - Statut: `EN_ATTENTE`
   - `statut_centre_depot`: `validé`
   - Notification créée pour l'admin

3. **Admin approuve**
   - `PATCH /api/documents/{id}/valider` avec `statut: VALIDE`
   - Statut: `VALIDE`

### Scénario 2: Rejet

1. **Étudiant soumet un document**
   - Statut: `EN_ATTENTE`
   - `statut_centre_depot`: `null`

2. **Centre Dépôt rejette**
   - `POST /api/centre-depot/documents/{id}/reject`
   - Statut: `EN_ATTENTE`
   - `statut_centre_depot`: `rejeté`
   - `motif_rejet_centre_depot`: "Motif du rejet"
   - Notification créée pour l'étudiant

3. **Étudiant reçoit notification et peut résubmitter**

## Notifications

### Types de notifications

- **info**: Information générale
- **success**: Action réussie
- **warning**: Avertissement
- **error**: Erreur

### Groupement des notifications

Les notifications du centre dépôt sont groupées par étudiant:

```json
{
  "groupé_par": "etudiant",
  "reference_id": 1,
  "count": 3,
  "message": "3 documents en attente de validation pour Jean Dupont"
}
```

## Permissions

### Centre Dépôt
- `documents.view_pending` - Voir les documents en attente
- `documents.validate` - Valider les documents
- `documents.reject` - Rejeter les documents
- `notifications.view_grouped` - Voir les notifications groupées

### Admin
- Toutes les permissions

## Exemples cURL

### Valider un document
```bash
curl -X POST http://localhost:8000/api/centre-depot/documents/1/validate \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### Rejeter un document
```bash
curl -X POST http://localhost:8000/api/centre-depot/documents/1/reject \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"motif": "Document illisible et incomplet"}'
```

### Récupérer les notifications
```bash
curl -X GET http://localhost:8000/api/centre-depot/notifications \
  -H "Authorization: Bearer {token}"
```

## Limites et considérations

- Un document ne peut être validé/rejeté qu'une seule fois
- Le motif de rejet doit contenir au moins 10 caractères
- Les notifications sont groupées par étudiant pour le centre dépôt
- L'historique des validations est conservé dans la table `document_histories`
