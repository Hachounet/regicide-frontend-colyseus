import { Client } from 'colyseus.js';

class GameService {
  constructor() {
    // URL du serveur Colyseus - à ajuster selon l'environnement
    const serverUrl = 'wss://regicide-backend-colyseus.onrender.com'; // TODO: configurer via .env
    this.client = new Client(serverUrl);
    this.room = null;
  }

  /**
   * Rejoindre ou créer une room Regicide
   */
  async joinRoom(pseudo, options = {}) {
    try {
      const mode = options.mode || 'public'; // 'public', 'create', 'join'
      const roomOptions = {
        playerCount: options.playerCount || 4,
        isPrivate: mode !== 'public',
        roomCode: options.roomCode || null,
        pseudo: pseudo
      };

      console.log('Tentative de connexion avec:', { mode, roomOptions });

      if (mode === 'create') {
        // Créer une room privée
        this.room = await this.client.create('regicide', roomOptions);
        console.log('Room privée créée, ID:', this.room.roomId, 'Code:', options.roomCode);
      } else {
        // Rejoindre ou créer une room publique/privée
        this.room = await this.client.joinOrCreate('regicide', roomOptions);
        console.log('Rejoint/créé une room, ID:', this.room.roomId);
      }

      return this.room;
      
    } catch (error) {
      console.error('Erreur détaillée lors de la connexion:', error);
      console.error('Stack trace:', error.stack);
      
      // Extraire le message d'erreur de manière sûre
      const errorMessage = error?.message || error?.toString() || 'Erreur inconnue';
      
      // Gestion spécifique de l'erreur rootSchema
      if (errorMessage.includes('rootSchema')) {
        throw new Error('Le serveur backend ne définit pas de schéma valide. Vérifiez la configuration côté serveur.');
      }
      
      if (error?.code === 4212) {
        throw new Error('Room non trouvée ou serveur indisponible');
      }
      
      throw new Error(`Impossible de rejoindre la partie: ${errorMessage}`);
    }
  }

  /**
   * Rejoindre une room spécifique par ID
   */
  async joinRoomById(roomId, pseudo) {
    try {
      this.room = await this.client.joinById(roomId, { pseudo });
      return this.room;
    } catch (error) {
      console.error('Erreur lors de la connexion à la room:', error);
      throw new Error('Room introuvable ou pleine');
    }
  }

  /**
   * Se reconnecter à une room avec un token de reconnexion
   */
  async reconnectToRoom(roomId, reconnectionToken) {
    try {
      console.log('Tentative de reconnexion avec token...', { roomId });
      this.room = await this.client.reconnect(roomId, reconnectionToken);
      console.log('Reconnexion réussie!');
      return this.room;
    } catch (error) {
      console.error('Erreur lors de la reconnexion:', error);
      throw new Error('Impossible de se reconnecter à la partie');
    }
  }

  /**
   * Quitter la room actuelle
   */
  async leaveRoom(consented = true) {
    if (this.room) {
      await this.room.leave(consented);
      this.room = null;
    }
  }

  /**
   * Obtenir la room actuelle
   */
  getRoom() {
    return this.room;
  }

  /**
   * Vérifier si connecté à une room
   */
  isConnected() {
    return this.room !== null;
  }

  // Messages à envoyer au serveur

  /**
   * Marquer le joueur comme prêt
   */
  setReady() {
    this.room?.send('player_ready');
  }

  /**
   * Annuler le statut prêt
   */
  setNotReady() {
    this.room?.send('player_not_ready');
  }

  /**
   * Choisir des cartes lors du draft
   */
  selectDraftCards(cardIds) {
    const message = { cardIds };
    this.room?.send('draft_cards', message);
  }

  /**
   * Jouer une carte (placement, remplacement ou pouvoir spécial)
   */
  playCard(message) {
    this.room?.send('play_card', message);
  }

  /**
   * Envoyer un message de chat
   */
  sendChatMessage(text) {
    const message = { text };
    this.room?.send('chat_message', message);
  }

  /**
   * Écouter les changements d'état
   */
  onStateChange(callback) {
    this.room?.onStateChange(callback);
  }

  /**
   * Écouter un message spécifique
   */
  onMessage(type, callback) {
    this.room?.onMessage(type, callback);
  }

  /**
   * Écouter les erreurs
   */
  onError(callback) {
    this.room?.onError(callback);
  }

  /**
   * Écouter la fermeture de connexion
   */
  onLeave(callback) {
    this.room?.onLeave(callback);
  }

  /**
   * Obtenir l'ID de session du joueur
   */
  getSessionId() {
    return this.room?.sessionId || null;
  }

  /**
   * Obtenir l'ID de la room
   */
  getRoomId() {
    return this.room?.roomId || null;
  }

  /**
   * Envoyer un message générique
   */
  sendMessage(type, data = {}) {
    if (this.room) {
      this.room.send(type, data);
    }
  }
}

// Instance singleton du service
const gameService = new GameService();
export default gameService;
