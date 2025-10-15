import { Client } from 'colyseus.js';

class GameService {
  constructor() {
    // URL du serveur Colyseus - à ajuster selon l'environnement
    const serverUrl = 'ws://localhost:2567'; // TODO: configurer via .env
    this.client = new Client(serverUrl);
    this.room = null;
  }

  /**
   * Rejoindre ou créer une room Regicide
   */
  async joinRoom(pseudo, options = {}) {
    try {
      const roomOptions = {
        playerCount: options.playerCount || 4,
        isPrivate: options.isPrivate || false,
        roomCode: options.roomCode || null,
        pseudo: pseudo
      };

      console.log('Tentative de connexion avec:', { roomOptions });

      // Essayons d'abord de rejoindre une room existante
      try {
        this.room = await this.client.join('regicide', roomOptions);
        console.log('Rejoint une room existante, ID:', this.room.roomId);
      } catch (joinError) {
        console.log('Aucune room trouvée, création d\'une nouvelle room...', joinError.message);
        // Si ça échoue, créons une nouvelle room
        this.room = await this.client.create('regicide', roomOptions);
        console.log('Nouvelle room créée, ID:', this.room.roomId);
      }

      return this.room;
      
    } catch (error) {
      console.error('Erreur détaillée lors de la connexion:', error);
      console.error('Stack trace:', error.stack);
      
      // Gestion spécifique de l'erreur rootSchema
      if (error.message.includes('rootSchema')) {
        throw new Error('Le serveur backend ne définit pas de schéma valide. Vérifiez la configuration côté serveur.');
      }
      
      if (error.code === 4212) {
        throw new Error('Room non trouvée ou serveur indisponible');
      }
      
      throw new Error(`Impossible de rejoindre la partie: ${error.message}`);
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
   * Quitter la room actuelle
   */
  async leaveRoom() {
    if (this.room) {
      await this.room.leave();
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
