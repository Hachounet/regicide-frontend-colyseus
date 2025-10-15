# Regicide Frontend

Frontend React pour le jeu de cartes stratégique multijoueur **Regicide**, développé avec Colyseus pour le temps réel.

## 🎮 À propos du jeu

Regicide est un jeu de cartes stratégique pour 3-4 joueurs où chaque joueur :

- Reçoit un **Roi secret** qui détermine sa famille (♥ ♦ ♣ ♠)
- Participe à une **phase de draft** pour sélectionner ses cartes
- Place/remplace des cartes sur une **pyramide 4x3x2x1** (10 emplacements)
- Utilise les **pouvoirs spéciaux** des figures (Dame, Valet)
- Marque des points uniquement avec les cartes de sa famille secrète

## 🛠️ Stack Technique

- **React 18** - Interface utilisateur
- **Vite** - Bundler et serveur de développement
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utilitaire
- **Framer Motion** - Animations fluides
- **Zustand** - Gestion d'état légère
- **React Query** - Gestion des requêtes HTTP
- **Colyseus.js** - Client WebSocket temps réel

## 🚀 Installation et démarrage

### Prérequis

- Node.js 18+
- npm ou yarn
- Backend Regicide Colyseus en cours d'exécution

### Installation

```bash
# Installer les dépendances
npm install

# Démarrer en développement
npm run dev
```

### Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualisation du build
npm run lint         # Analyse ESLint
```

## 📁 Structure du projet

```
src/
├── components/          # Composants React
│   ├── ui/             # Composants d'interface réutilisables
│   ├── game/           # Composants spécifiques au jeu
│   ├── ConnectionScreen.jsx
│   ├── LobbyScreen.jsx
│   ├── DraftScreen.jsx
│   ├── GameScreen.jsx
│   └── ResultsScreen.jsx
├── stores/             # Stores Zustand
│   ├── gameStore.ts    # État du jeu
│   ├── uiStore.ts      # État de l'interface
│   └── connectionStore.ts
├── services/           # Services externes
│   └── gameService.ts  # Service Colyseus
├── hooks/              # Hooks personnalisés
│   └── useGameConnection.ts
├── utils/              # Utilitaires
│   └── gameRules.ts    # Logique des règles
├── types/              # Types TypeScript
│   └── game.ts
└── App.jsx             # Composant principal
```

## 🎯 Fonctionnalités

### ✅ Implémentées

- [x] Architecture de base React + Vite + TypeScript
- [x] Stores Zustand pour l'état global
- [x] Service Colyseus avec WebSocket
- [x] Système de types TypeScript complet
- [x] Utilitaires pour les règles du jeu
- [x] Interface de connexion
- [x] Système de notifications
- [x] Configuration Tailwind avec thème personnalisé

### 🚧 En cours de développement

- [ ] Écran de lobby avec liste des joueurs
- [ ] Interface de draft avec sélection multiple
- [ ] Plateau de jeu avec pyramide interactive
- [ ] Système de drag & drop pour les cartes
- [ ] Gestion des pouvoirs spéciaux (Dame/Valet)
- [ ] Écran de résultats avec scores détaillés
- [ ] Chat en temps réel
- [ ] Reconnexion automatique

## 🔧 Configuration

### Variables d'environnement

```env
# URL du serveur Colyseus
VITE_COLYSEUS_URL=ws://localhost:2567

# Environnement
VITE_NODE_ENV=development
```
