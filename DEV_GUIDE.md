# Regicide Frontend - Guide de Développement

## 🚀 Démarrage rapide

```bash
# Installation
npm install

# Développement
npm run dev
# -> http://localhost:5173

# Backend Regicide (à démarrer séparément)
# Assure-vous que le serveur Colyseus fonctionne sur ws://localhost:2567
```

## 📋 Checklist de développement

### Phase 1 : Infrastructure ✅

- [x] Configuration Vite + React
- [x] Installation des dépendances (Colyseus, Zustand, Framer Motion, Tailwind)
- [x] Configuration Tailwind avec thème personnalisé
- [x] Types TypeScript complets
- [x] Service Colyseus de base
- [x] Stores Zustand (game, ui, connection)
- [x] Hook de connexion
- [x] Utilitaires pour les règles

### Phase 2 : Composants de base ✅

- [x] Composant Card avec animations
- [x] Composant Button réutilisable
- [x] Écran de connexion fonctionnel
- [x] Système de notifications
- [x] Structure de navigation entre écrans

### Phase 3 : À développer 🚧

- [ ] **LobbyScreen** : Liste joueurs + bouton Ready
- [ ] **DraftScreen** : Sélection multiple de cartes
- [ ] **GameScreen** : Pyramide interactive + main du joueur
- [ ] **Pyramid** : Composant pyramide avec drag & drop
- [ ] **PlayerHand** : Affichage main du joueur
- [ ] **Chat** : Système de chat temps réel
- [ ] **ResultsScreen** : Scores finaux avec révélation

## 🎯 Composants prioritaires

### 1. LobbyScreen (Urgent)

```jsx
// src/components/LobbyScreen.jsx
- Afficher liste des joueurs connectés
- Bouton Ready/Not Ready
- Indicateur de statut des joueurs
- Chat intégré
- Informations de la room
```

### 2. Pyramid (Core Gameplay)

```jsx
// src/components/game/Pyramid.jsx
- Grille 4x3x2x1 interactive
- Positions valides highlighted
- Drag & drop depuis la main
- Animations de placement/remplacement
- Gestion des pouvoirs spéciaux
```

### 3. DraftScreen (Game Flow)

```jsx
// src/components/DraftScreen.jsx
- Affichage du paquet reçu
- Sélection multiple (1-2 cartes selon règles)
- Compteur de sélection
- Timer de draft
- Progression des rounds
```

## 🔧 Configuration actuelle

### Stores Zustand

- **gameStore** : État du jeu Colyseus
- **uiStore** : Interface utilisateur (sélections, modales, notifications)
- **connectionStore** : Connexion WebSocket et configuration

### Services

- **gameService** : Interface Colyseus (singleton)

### Types

- **game.ts** : Types complets basés sur l'API backend

## 🎮 Flux de jeu implémenté

```
[ConnectionScreen]
    ↓ connect()
[LoadingScreen]
    ↓ WebSocket établi
[LobbyScreen] ← À développer
    ↓ tous prêts
[DraftScreen] ← À développer
    ↓ draft terminé
[GameScreen] ← À développer
    ↓ partie terminée
[ResultsScreen] ← À développer
```

## 💻 Commands de développement

```bash
# Développement avec HMR
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview

# Linting
npm run lint

# Check TypeScript
npm run type-check
```

## 🐛 Debug

### WebSocket Colyseus

- Vérifier que le backend fonctionne sur `ws://localhost:2567`
- Monitor disponible sur `http://localhost:2567/monitor`
- Playground sur `http://localhost:2567` (dev seulement)

### État des stores

```javascript
// Dans les devtools React
// Zustand stores sont inspectables
useGameStore.getState();
useUIStore.getState();
useConnectionStore.getState();
```

### Messages Colyseus

```javascript
// Service de debug dans gameService
const room = gameService.getRoom();
room.onMessage("*", (type, data) => {
  console.log(`Message: ${type}`, data);
});
```

## 📝 Prochaines étapes

1. **Développer LobbyScreen** avec liste joueurs
2. **Intégrer les hooks** de connexion dans tous les écrans
3. **Créer le composant Pyramid** avec interactions
4. **Implémenter DraftScreen** avec sélection de cartes
5. **Ajouter les animations** Framer Motion
6. **Tests** avec le backend en cours d'exécution

## 🔗 Ressources

- [Backend Regicide](../FRONTEND_INTEGRATION_GUIDE.md)
- [API Reference](../API_REFERENCE.md)
- [Frontend Examples](../FRONTEND_EXAMPLES.md)
- [Colyseus Docs](https://docs.colyseus.io/)
