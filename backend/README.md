# SGEE Backend - API Laravel

Système de Gestion d'Enrôlement des Étudiants - Backend API

## Prérequis

- PHP >= 8.1
- Composer
- MySQL / MariaDB
- Extensions PHP : BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML

## Installation

```bash
# Installer les dépendances
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer la base de données dans .env
# DB_DATABASE=sgee
# DB_USERNAME=root
# DB_PASSWORD=

# Exécuter les migrations
php artisan migrate

# Peupler la base de données
php artisan db:seed

# Créer le lien symbolique pour le storage
php artisan storage:link
```

## Lancer le serveur

```bash
php artisan serve
```

Le serveur sera accessible sur `http://localhost:8000`

## Comptes de test

- **Admin** : admin@sgee.com / password123
- **Étudiant** : etudiant@test.com / password123

## Structure de l'API

### Routes publiques
- `POST /api/login` - Connexion
- `POST /api/register` - Inscription
- `GET /api/concours` - Liste des concours
- `GET /api/concours/ouverts` - Concours ouverts
- `GET /api/departements` - Liste des départements
- `GET /api/filieres` - Liste des filières
- `GET /api/niveaux` - Liste des niveaux
- `GET /api/centre-depots` - Centres de dépôt
- `GET /api/centre-examens` - Centres d'examen

### Routes protégées (authentification requise)
- `GET /api/me` - Profil utilisateur
- `POST /api/logout` - Déconnexion

### Routes Étudiant
- `POST /api/etudiants/register-profile` - Créer profil
- `POST /api/documents/upload` - Upload documents
- `POST /api/paiements/submit` - Soumettre paiement
- `GET /api/my-enrollement` - Mon enrôlement
- `GET /api/enrollements/{id}/pdf` - Télécharger fiche PDF

### Routes Admin
- CRUD complet sur : etudiants, departements, filieres, niveaux, concours
- `GET /api/departements/{id}/export-etudiants` - Export PDF étudiants
- `POST /api/paiements/{id}/valider` - Valider paiement
- `PATCH /api/enrollements/{id}/statut` - Changer statut enrôlement
- `GET /api/admin/documents` - Voir tous les documents avec statut centre_depot
- `GET /api/admin/documents/{id}/history` - Historique de validation d'un document

### Routes Centre Dépôt
- `GET /api/centre-depot/documents` - Documents en attente de validation
- `POST /api/centre-depot/documents/{id}/validate` - Valider un document
- `POST /api/centre-depot/documents/{id}/reject` - Rejeter un document
- `GET /api/centre-depot/notifications` - Notifications groupées par étudiant
- `GET /api/centre-depot/students/{id}/documents` - Documents d'un étudiant

## Feature: Validation des documents par Centre Dépôt

### Vue d'ensemble

Le centre de dépôt valide les documents des étudiants avant qu'ils n'arrivent à l'administrateur. Cette feature implémente:

- ✅ Validation intermédiaire des documents
- ✅ Notifications groupées par étudiant
- ✅ Historique complet des validations
- ✅ Permissions granulaires
- ✅ Workflow sécurisé

### Workflow

1. **Étudiant soumet des documents** → Statut: `EN_ATTENTE`
2. **Centre Dépôt valide/rejette** → Statut: `validé` ou `rejeté`
3. **Admin approuve/rejette** → Statut final: `VALIDE` ou `REJETE`

### Permissions Centre Dépôt

- `documents.view_pending` - Voir les documents en attente
- `documents.validate` - Valider les documents
- `documents.reject` - Rejeter les documents
- `notifications.view_grouped` - Voir les notifications groupées

### Notifications groupées

Les notifications du centre dépôt sont groupées par étudiant:

```
"3 documents en attente de validation pour Jean Dupont"
```

Cela évite de surcharger le centre dépôt avec trop de notifications individuelles.

### Documentation complète

Voir `API_DOCUMENTATION.md` pour la documentation complète des endpoints.

## Technologies

- Laravel 10
- Laravel Sanctum (authentification API)
- DomPDF (génération PDF)
- Simple QRCode (génération QR codes)
