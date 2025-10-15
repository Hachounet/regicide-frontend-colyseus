import { useCallback } from 'react';
import { useGameStore } from '../stores/gameStore.js';
import { useConnectionStore } from '../stores/connectionStore.js';
import { useUIStore } from '../stores/uiStore.js';
import gameService from '../services/gameService.js';

export const useGameConnection = () => {
  const { 
    setGameState, 
    setMySessionId,
    reset: resetGameStore 
  } = useGameStore();
  
  const { 
    setConnecting,
    setConnected,
    setError,
    setRoomId,
    playerPseudo,
    incrementReconnectAttempts,
    canReconnect,
    reset: resetConnectionStore
  } = useConnectionStore();
  
  const { 
    addNotification, 
    setLoading,
    reset: resetUIStore 
  } = useUIStore();

  /**
   * Configurer les listeners de la room
   */
  const setupRoomListeners = useCallback((room) => {
    // État du jeu
    room.onStateChange((state) => {
      console.log('🎮 State reçu du serveur:', state);
      setGameState(state);
    });

    // Messages du serveur
    room.onMessage('waiting_for_players', (data) => {
      console.log('En attente de joueurs:', data);
    });

    room.onMessage('player_ready_update', (data) => {
      addNotification(`${data.pseudo} ${data.isReady ? 'est prêt' : 'n\'est plus prêt'}`);
    });

    room.onMessage('draft_started', (data) => {
      addNotification(`Phase de draft commencée - Round ${data.round}`);
      setLoading(false);
    });

    room.onMessage('draft_pack_received', (data) => {
      addNotification(`Nouveau paquet reçu - Choisissez ${data.pickCount} carte(s)`);
    });

    room.onMessage('draft_complete', () => {
      addNotification('Phase de draft terminée - La partie commence !');
    });

    room.onMessage('turn_changed', (data) => {
      const isMyTurn = data.currentPlayerSessionId === room.sessionId;
      addNotification(
        isMyTurn 
          ? 'C\'est votre tour !' 
          : `C'est au tour de ${data.currentPseudo}`
      );
    });

    room.onMessage('card_placed', (data) => {
      const isMe = data.playerSessionId === room.sessionId;
      addNotification(
        `${isMe ? 'Vous avez' : data.pseudo + ' a'} placé ${data.card.value} de ${data.card.suit}`
      );
    });

    room.onMessage('special_power_activated', (data) => {
      const isMe = data.playerSessionId === room.sessionId;
      addNotification(
        `${isMe ? 'Vous avez' : data.pseudo + ' a'} activé: ${data.power}`
      );
    });

    room.onMessage('game_over', (data) => {
      addNotification(
        data.winner ? 
        `Partie terminée ! Gagnant: ${data.winner}` : 
        'Partie terminée - Égalité'
      );
    });

    room.onMessage('error', (data) => {
      addNotification(`Erreur: ${data.message}`);
    });

    // Handler pour éviter les warnings du playground Colyseus
    room.onMessage('__playground_message_types', () => {
      // Ignorer ce message du playground
    });

    // Gestion de la déconnexion
    room.onLeave((code) => {
      console.log('Déconnexion de la room, code:', code);
      setConnected(false);
      
      if (code !== 1000) { // Code 1000 = déconnexion normale
        setError('Connexion perdue');
        addNotification('Connexion perdue, tentative de reconnexion...');
      }
    });

  }, [setGameState, addNotification, setLoading, setConnected, setError]);

  /**
   * Reconnexion automatique
   */
  const reconnect = useCallback(async () => {
    if (!canReconnect()) {
      setError('Nombre maximum de tentatives de reconnexion atteint');
      return false;
    }

    try {
      incrementReconnectAttempts();
      addNotification('Tentative de reconnexion...');
      
      // Pour l'instant, on fait une nouvelle connexion avec le pseudo existant
      const room = await gameService.joinRoom(playerPseudo);
      
      if (!room) {
        throw new Error('Impossible de rejoindre la room');
      }

      setupRoomListeners(room);
      setConnected(true);
      setRoomId(room.id);
      setMySessionId(room.sessionId);
      addNotification('Reconnexion réussie !');
      
      return true;
      
    } catch (err) {
      console.error('Échec de la reconnexion:', err);
      setError('Échec de la reconnexion');
      return false;
    }
  }, [canReconnect, incrementReconnectAttempts, addNotification, playerPseudo, setupRoomListeners, setConnected, setRoomId, setMySessionId, setError]);

  /**
   * Se connecter à une room
   */
  const connect = useCallback(async (
    pseudo,
    options = {}
  ) => {
    const finalPseudo = pseudo || playerPseudo;
    
    if (!finalPseudo.trim()) {
      setError('Pseudo requis');
      return false;
    }

    try {
      setConnecting(true);
      setError(null);

      const room = await gameService.joinRoom(finalPseudo, options);
      
      if (!room) {
        throw new Error('Impossible de rejoindre la room');
      }

      // Configuration des listeners
      setupRoomListeners(room);

      // Mise à jour de l'état
      setConnected(true);
      setRoomId(room.id);
      setMySessionId(room.sessionId);
      setConnecting(false);
      
      addNotification('Connexion établie !');
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      addNotification(`Erreur: ${errorMessage}`);
      return false;
    } finally {
      setConnecting(false);
    }
  }, [playerPseudo, setConnecting, setConnected, setError, setRoomId, setMySessionId, addNotification, setupRoomListeners]);

  /**
   * Se déconnecter
   */
  const disconnect = useCallback(async () => {
    try {
      await gameService.leaveRoom();
      setConnected(false);
      setRoomId(null);
      resetGameStore();
      addNotification('Déconnecté');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  }, [setConnected, setRoomId, resetGameStore, addNotification]);

  /**
   * Reset complet
   */
  const resetAll = useCallback(() => {
    resetGameStore();
    resetConnectionStore();
    resetUIStore();
  }, [resetGameStore, resetConnectionStore, resetUIStore]);

  /**
   * Envoyer un message à la room
   */
  const sendMessage = useCallback((type, data = {}) => {
    try {
      gameService.sendMessage(type, data);
      return true;
    } catch (err) {
      console.error('Erreur envoi message:', err);
      addNotification('Erreur lors de l\'envoi du message');
      return false;
    }
  }, [addNotification]);

  return {
    connect,
    disconnect,
    reconnect,
    resetAll,
    sendMessage
  };
};
