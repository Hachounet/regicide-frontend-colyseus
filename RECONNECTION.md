# Système de Reconnexion - Regicide Frontend

## Vue d'ensemble

Le frontend Regicide implémente un système de reconnexion robuste qui permet aux joueurs de reprendre leur partie après une déconnexion (par exemple, écran de mobile qui s'éteint, perte de réseau temporaire, etc.).

## Architecture

### Composants principaux

1. **connectionStore.js** : Store Zustand pour gérer l'état de connexion et le token de reconnexion
2. **gameService.js** : Service pour gérer la communication avec le serveur Colyseus
3. **useGameConnection.js** : Hook personnalisé pour gérer les connexions/déconnexions/reconnexions
4. **ReconnectionNotification.jsx** : Composant UI pour afficher les notifications de reconnexion

## Fonctionnement

### 1. Sauvegarde du token de reconnexion

Lorsque le joueur se connecte, le serveur envoie un token de reconnexion qui est automatiquement sauvegardé dans le localStorage via Zustand persist :

```javascript
// Dans useGameConnection.js - setupRoomListeners
room.onMessage("reconnection_token", (message) => {
  console.log("📝 Token de reconnexion reçu");
  setReconnectionToken(message.token);
});
```

Le token est persisté automatiquement grâce à la configuration Zustand :

```javascript
// Dans connectionStore.js
partialize: (state) => ({
  serverUrl: state.serverUrl,
  playerPseudo: state.playerPseudo,
  lastRoomId: state.lastRoomId,
  reconnectionToken: state.reconnectionToken,
  roomId: state.roomId,
});
```

### 2. Détection de déconnexion

Le hook détecte automatiquement les déconnexions et différencie les déconnexions volontaires (code 1000) des déconnexions involontaires :

```javascript
room.onLeave((code) => {
  setConnected(false);

  if (code !== 1000) {
    // Déconnexion involontaire : garder le token
    setError("Connexion perdue");
    console.warn("⚠️ Connexion perdue, tentative de reconnexion...");
  } else {
    // Déconnexion volontaire : nettoyer le token
    console.log("👋 Déconnexion volontaire");
    clearReconnectionToken();
  }
});
```

### 3. Reconnexion automatique

Lorsqu'une déconnexion involontaire est détectée :

1. Le composant `ReconnectionNotification` s'affiche
2. Après 2 secondes, une tentative de reconnexion automatique démarre
3. Le système utilise le token sauvegardé pour se reconnecter :

```javascript
// Dans useGameConnection.js - reconnect()
const room = await gameService.reconnectToRoom(roomId, reconnectionToken);
setupRoomListeners(room);
setConnected(true);
```

### 4. Gestion des tentatives

- Maximum 3 tentatives de reconnexion
- Après épuisement des tentatives, le token est nettoyé
- L'utilisateur peut aussi déclencher manuellement une reconnexion via le bouton "Réessayer"

### 5. Notifications aux joueurs

Le système écoute les messages du serveur pour informer les autres joueurs :

```javascript
room.onMessage("player_reconnected", (message) => {
  console.log(`✅ ${message.pseudo} s'est reconnecté`);
});

room.onMessage("player_disconnected", (message) => {
  console.log(`❌ ${message.pseudo} s'est déconnecté pendant ${message.phase}`);
});
```

## Scénarios d'utilisation

### Scénario 1 : Écran de mobile qui s'éteint

1. L'écran s'éteint → WebSocket se ferme (code !== 1000)
2. Le frontend détecte la déconnexion involontaire
3. Le token de reconnexion est préservé dans le localStorage
4. Affichage de la notification "Connexion perdue"
5. Après 2 secondes : tentative automatique de reconnexion
6. L'utilisateur rallume son écran
7. La reconnexion s'effectue avec le token sauvegardé
8. Le joueur retrouve son état de jeu exact

### Scénario 2 : Perte de réseau temporaire

1. Connexion réseau perdue → déconnexion involontaire
2. Même processus que le scénario 1
3. Quand le réseau revient, reconnexion automatique
4. Si échec, l'utilisateur peut cliquer sur "Réessayer"

### Scénario 3 : Départ volontaire

1. L'utilisateur clique sur "Quitter" ou "Retourner au lobby"
2. `disconnect()` est appelé avec `consented = true`
3. Le token de reconnexion est nettoyé du localStorage
4. Le serveur reçoit la déconnexion volontaire
5. En phase WAITING : le joueur est retiré immédiatement
6. Pas de tentative de reconnexion automatique

### Scénario 4 : Rafraîchissement de page

1. L'utilisateur rafraîchit la page (F5)
2. Le token et le roomId sont récupérés du localStorage via Zustand persist
3. Si toujours valides, reconnexion automatique au chargement
4. Le joueur retrouve immédiatement sa partie

## Configuration

### Store de connexion (connectionStore.js)

```javascript
const initialState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  roomId: null,
  reconnectionToken: null,
  isReconnecting: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 3,
  // ...
};
```

### Méthodes disponibles

- `setReconnectionToken(token)` : Sauvegarder le token
- `clearReconnectionToken()` : Nettoyer le token
- `hasReconnectionToken()` : Vérifier si un token existe
- `setReconnecting(bool)` : Indiquer qu'une reconnexion est en cours
- `incrementReconnectAttempts()` : Incrémenter le compteur
- `canReconnect()` : Vérifier si d'autres tentatives sont possibles

## Interface utilisateur

### ReconnectionNotification

Composant automatique qui :

- S'affiche uniquement en cas de déconnexion involontaire
- Montre un spinner pendant la reconnexion
- Affiche le nombre de tentatives (1/3, 2/3, etc.)
- Propose un bouton "Réessayer" pour forcer une tentative manuelle
- Se masque automatiquement une fois reconnecté

### Emplacement

Positionné en haut de l'écran (fixed top-4) avec un z-index élevé pour être visible sur tous les écrans du jeu.

## Points techniques importants

### Différence entre sessionId et reconnectionToken

- **sessionId** : Identifie la connexion WebSocket actuelle (change à chaque reconnexion)
- **reconnectionToken** : Identifie le joueur de manière persistante (reste le même)

### Sécurité

- Le token est généré côté serveur
- Stocké de manière sécurisée dans le localStorage
- Nettoyé automatiquement lors de déconnexions volontaires ou après échec définitif

### Délais

- **Délai avant reconnexion automatique** : 2 secondes
- **Nombre maximum de tentatives** : 3
- **Délais côté serveur** :
  - Phase WAITING : 60 secondes
  - Phase DRAFTING/PLAYING/FINISHED : 120 secondes

## FAQ

**Q : Que se passe-t-il si le token expire côté serveur ?**

R : Si le délai de reconnexion (60-120s) est écoulé côté serveur, la tentative de reconnexion échouera. Le frontend nettoiera alors le token après épuisement des tentatives.

**Q : Le token survit-il au rafraîchissement de page ?**

R : Oui, grâce à Zustand persist, le token est sauvegardé dans le localStorage et récupéré automatiquement au rechargement.

**Q : Peut-on désactiver la reconnexion automatique ?**

R : Actuellement non, mais vous pouvez modifier le délai de 2 secondes dans `ReconnectionNotification.jsx` ou désactiver le composant.

**Q : Que se passe-t-il si on se connecte depuis un autre appareil avec le même token ?**

R : Techniquement possible, mais peut créer des conflits. Le dernier à se connecter prend la place.

**Q : Les autres joueurs sont-ils notifiés de ma déconnexion/reconnexion ?**

R : Oui, le serveur envoie des messages `player_disconnected` et `player_reconnected` à tous les joueurs de la room.

## Logs de debug

Le système affiche des logs détaillés dans la console :

- 📝 Token de reconnexion reçu
- ✅ [Pseudo] s'est reconnecté
- ❌ [Pseudo] s'est déconnecté pendant [phase]
- ⚠️ Connexion perdue, tentative de reconnexion...
- 🔄 Tentative de reconnexion automatique...
- 👋 Déconnexion volontaire

Ces emojis facilitent le debug et le suivi en temps réel.
