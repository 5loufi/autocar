# AutoGest — Guide de démarrage

## Prérequis

1. **Node.js 18+** — https://nodejs.org/
2. **PostgreSQL** — ou utiliser [Neon](https://neon.tech) (gratuit) / [Supabase](https://supabase.com) (gratuit)

---

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier d'environnement
cp .env.example .env

# 3. Remplir DATABASE_URL dans .env
# Exemple Neon : postgresql://user:password@host/autogest?sslmode=require

# 4. Créer les tables en base
npm run db:push

# 5. (Optionnel) Charger des données de démonstration
npm run db:seed

# 6. Lancer le serveur de développement
npm run dev
```

Ouvrir http://localhost:3000

---

## Structure du projet

```
src/
├── app/
│   ├── (app)/              ← Pages protégées avec layout sidebar
│   │   ├── dashboard/      ← Tableau de bord
│   │   ├── vehicules/      ← Gestion du parc
│   │   ├── clients/        ← Gestion des clients
│   │   ├── reservations/   ← Réservations
│   │   ├── contrats/       ← Contrats de location
│   │   ├── paiements/      ← Suivi des paiements
│   │   ├── calendrier/     ← Vue calendrier
│   │   ├── entretien/      ← Entretien véhicules
│   │   ├── rapports/       ← Statistiques & graphiques
│   │   └── parametres/     ← Configuration
│   └── api/                ← Routes API REST
├── components/
│   ├── ui/                 ← Composants réutilisables
│   └── layout/             ← Sidebar, Header
├── lib/
│   ├── prisma.ts           ← Client Prisma
│   └── utils.ts            ← Utilitaires, labels, couleurs
└── prisma/
    ├── schema.prisma       ← Schéma base de données
    └── seed.ts             ← Données de démo
```

## Fonctionnalités

- Tableau de bord avec KPIs en temps réel
- Gestion complète du parc véhicules (CRUD)
- Gestion des clients avec historique
- Réservations avec calcul automatique du prix
- Contrats générés automatiquement
- Suivi des paiements avec statuts
- Calendrier visuel mensuel
- Entretien avec rappels d'alertes
- Rapports avec graphiques
- Mode clair / sombre
- Design Apple-inspired premium
