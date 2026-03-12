# SGEE Frontend - React + TypeScript

Système de Gestion d'Enrôlement des Étudiants - Interface utilisateur

## Prérequis

- Node.js >= 18
- npm ou yarn

## Installation

```bash
# Installer les dépendances
npm install

# Configurer l'URL de l'API (si différente de localhost:8000)
# Modifier vite.config.ts si nécessaire
```

## Lancer le serveur de développement

```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`

## Build pour la production

```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/`

## Structure du projet

```
src/
├── components/       # Composants réutilisables
│   └── Layout.tsx    # Layout principal avec navigation
├── contexts/         # Contextes React
│   └── AuthContext.tsx  # Gestion de l'authentification
├── pages/            # Pages de l'application
│   ├── admin/        # Pages administration
│   │   ├── AdminConcours.tsx      # Gestion des concours
│   │   ├── AdminDepartements.tsx  # Export étudiants par département
│   │   ├── AdminDocuments.tsx     # Validation documents
│   │   ├── AdminPaiements.tsx     # Validation paiements
│   │   └── AdminDashboard.tsx     # Tableau de bord admin
│   ├── Dashboard.tsx       # Tableau de bord étudiant
│   ├── Documents.tsx       # Upload documents
│   ├── Enrollement.tsx     # Suivi enrôlement
│   ├── Login.tsx           # Connexion
│   ├── Paiement.tsx        # Soumission paiement
│   ├── Register.tsx        # Inscription
│   └── StudentProfile.tsx  # Profil étudiant + choix concours
├── services/         # Services API
│   └── api.ts        # Configuration Axios
├── App.tsx           # Routes de l'application
└── main.tsx          # Point d'entrée
```

## Fonctionnalités

### Espace Étudiant
- Inscription et connexion
- Choix du concours/école
- Complétion du profil
- Upload des documents requis
- Soumission du paiement
- Suivi de l'enrôlement
- Téléchargement de la fiche d'inscription (PDF avec QR code)

### Espace Administration
- Tableau de bord avec statistiques
- Validation des paiements
- Validation des documents
- Gestion des concours (CRUD)
- Export PDF des étudiants par département

## Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios
