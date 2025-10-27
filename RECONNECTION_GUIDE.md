# Guide d'utilisation - Système de Reconnexion

## Pour les développeurs

### Modifications apportées

Le système de reconnexion a été implémenté avec les modifications suivantes :

#### 1. `src/stores/connectionStore.js`

- ✅ Ajout de `reconnectionToken` persisté dans localStorage
- ✅ Ajout de `isReconnecting` pour suivre l'état de reconnexion
- ✅ Nouvelles méthodes :
  - `setReconnectionToken(token)`
  - `clearReconnectionToken()`
  - `hasReconnectionToken()`
  - `setReconnecting(bool)`

#### 2. `src/services/gameService.js`

- ✅ Nouvelle méthode `reconnectToRoom(roomId, token)` utilisant `client.reconnect()`
- ✅ Modification de `leaveRoom()` pour accepter un paramètre `consented`

#### 3. `src/hooks/useGameConnection.js`

- ✅ Gestion du message `reconnection_token` du serveur
- ✅ Gestion des messages `player_reconnected` et `player_disconnected`
- ✅ Distinction entre déconnexion volontaire (code 1000) et involontaire
- ✅ Fonction `reconnect()` améliorée avec le vrai token
- ✅ Nettoyage automatique du token selon le type de déconnexion

#### 4. `src/components/ui/ReconnectionNotification.jsx`

- ✅ Nouveau composant pour afficher les notifications de reconnexion
- ✅ Reconnexion automatique après 2 secondes
- ✅ Bouton manuel "Réessayer"
- ✅ Affichage du nombre de tentatives

#### 5. `src/App.jsx`

- ✅ Intégration du composant `ReconnectionNotification`

### Comment tester

#### Test 1 : Déconnexion du serveur

```bash
# 1. Lancer le frontend
npm run dev

# 2. Se connecter à une partie
# 3. Arrêter le serveur backend
# 4. Observer la notification de reconnexion
# 5. Redémarrer le serveur
# 6. La reconnexion devrait échouer (room n'existe plus)
```

#### Test 2 : Simulation de perte réseau (Chrome DevTools)

```bash
# 1. Lancer le frontend et se connecter
# 2. Ouvrir Chrome DevTools (F12)
# 3. Onglet Network > Throttling > Offline
# 4. Observer la notification de reconnexion
# 5. Remettre Online
# 6. La reconnexion devrait réussir
```

#### Test 3 : Rafraîchissement de page

```bash
# 1. Se connecter à une partie en cours
# 2. Appuyer sur F5 (rafraîchir)
# 3. Le token devrait être récupéré du localStorage
# 4. Reconnexion automatique
```

#### Test 4 : Déconnexion volontaire

```bash
# 1. Se connecter à une partie
# 2. Cliquer sur "Quitter" ou "Retourner au lobby"
# 3. Le token devrait être nettoyé
# 4. Pas de tentative de reconnexion automatique
```

### Logs de debug

Les logs suivants sont disponibles dans la console :

- `📝 Token de reconnexion reçu` - Token sauvegardé
- `✅ [Pseudo] s'est reconnecté` - Joueur reconnecté
- `❌ [Pseudo] s'est déconnecté pendant [phase]` - Joueur déconnecté
- `⚠️ Connexion perdue, tentative de reconnexion...` - Déconnexion détectée
- `🔄 Tentative de reconnexion automatique...` - Reconnexion en cours
- `👋 Déconnexion volontaire` - Départ intentionnel

### Configuration

Paramètres modifiables dans le code :

```javascript
// connectionStore.js - Nombre max de tentatives
maxReconnectAttempts: 3;

// ReconnectionNotification.jsx - Délai avant reconnexion auto
setTimeout(() => reconnect(), 2000); // 2 secondes
```

## Pour les utilisateurs

### Que se passe-t-il en cas de déconnexion ?

Si vous perdez la connexion pendant une partie (écran qui s'éteint, réseau instable, etc.) :

1. **Notification automatique** : Un message jaune apparaît en haut de l'écran
2. **Reconnexion automatique** : Après 2 secondes, le jeu tente de vous reconnecter
3. **Tentatives multiples** : Jusqu'à 3 tentatives automatiques
4. **Bouton manuel** : Vous pouvez aussi cliquer sur "Réessayer"

### Que faire si la reconnexion échoue ?

- Vérifiez votre connexion internet
- Attendez quelques secondes et réessayez
- Si le serveur a redémarré, la partie n'existe plus
- Retournez au menu principal pour rejoindre une nouvelle partie

### Quand le système de reconnexion ne fonctionne-t-il pas ?

- Après un départ volontaire (bouton "Quitter")
- Si la partie est terminée depuis plus de 2 minutes
- Si vous avez épuisé les 3 tentatives de reconnexion
- Si le serveur a été redémarré (les rooms sont perdues)

### Vos données sont-elles sauvegardées ?

Oui ! Pendant une déconnexion temporaire, le serveur conserve :

- Votre main de cartes
- Votre score
- Vos cartes en cours de draft
- Votre position dans la partie

Ces données sont préservées pendant **60 secondes** en phase d'attente et **120 secondes** pendant la partie.

## Diagramme de flux

```
┌─────────────────────┐
│  Joueur connecté    │
└──────────┬──────────┘
           │
           ├─── Déconnexion involontaire (réseau, crash, etc.)
           │    ├─> Notification affichée
           │    ├─> Token conservé dans localStorage
           │    ├─> Attente 2 secondes
           │    ├─> Tentative auto de reconnexion (max 3)
           │    │   ├─> ✅ Succès → Partie reprise
           │    │   └─> ❌ Échec → Nouvelle tentative ou abandon
           │    └─> Après 3 échecs → Token nettoyé
           │
           └─── Déconnexion volontaire (bouton Quitter)
                ├─> Token nettoyé immédiatement
                ├─> room.leave(consented=true)
                └─> Retour au menu
```

## Compatibilité

- ✅ Chrome, Firefox, Safari, Edge (versions récentes)
- ✅ Mobile (Android, iOS)
- ✅ Fonctionnement sur tous les écrans (responsive)
- ✅ Compatible avec le mode hors ligne partiel (reconnexion au retour en ligne)

## Support

En cas de problème :

1. Vérifiez les logs dans la console navigateur (F12)
2. Vérifiez que le serveur backend est bien en ligne
3. Testez avec les scénarios ci-dessus
4. Vérifiez le localStorage pour le token : `localStorage.getItem('reconnectionToken')`
