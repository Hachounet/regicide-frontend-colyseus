import { useCallback } from 'react';
import { useGameStore } from '../stores/gameStore.js';
import { useConnectionStore } from '../stores/connectionStore.js';
import { useUIStore } from '../stores/uiStore.js'; // Utilisé uniquement pour setLoading et reset
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
    reset: resetConnectionStore,
    setReconnectionToken,
    clearReconnectionToken,
    hasReconnectionToken,
    reconnectionToken,
    roomId,
    setReconnecting,
  } = useConnectionStore();
  
  const { 
    setLoading,
    reset: resetUIStore 
  } = useUIStore();

  /**
   * Configurer les listeners de la room
   */
  const setupRoomListeners = useCallback((room) => {
    // Sauvegarder le token de reconnexion
    room.onMessage("reconnection_token", (message) => {
      console.log('📝 Token de reconnexion reçu');
      setReconnectionToken(message.token);
    });

    // Notifications de reconnexion/déconnexion
    room.onMessage("player_reconnected", (message) => {
      console.log(`✅ ${message.pseudo} s'est reconnecté`);
    });

    room.onMessage("player_disconnected", (message) => {
      console.log(`❌ ${message.pseudo} s'est déconnecté pendant ${message.phase}`);
    });

    // État du jeu
    room.onStateChange((state) => {
      console.log('🎮 State reçu du serveur:', state);
      setGameState(state);
    });
    // Fin de partie avec scores
    room.onMessage('game_finished', (data) => {
      // On fusionne les scores et le gagnant dans gameState
      setGameState(prev => {
        // prev peut être null si la partie vient juste de finir
        const base = typeof prev === 'function' ? prev() : prev;
        return {
          ...(base || {}),
          phase: 'finished',
          winner: data.winner?.sessionId || data.winner,
          finalScores: data.finalScores || [],
        };
      });
      console.log(
        data.winner?.pseudo
          ? `Partie terminée ! Gagnant : ${data.winner.pseudo} (${data.winner.score} pts)`
          : 'Partie terminée !'
      );
    });

    // Messages du serveur
    room.onMessage('waiting_for_players', (data) => {
      console.log('En attente de joueurs:', data);
    });

    room.onMessage('player_ready_update', (data) => {
      console.log(`${data.pseudo} ${data.isReady ? 'est prêt' : 'n\'est plus prêt'}`);
    });

    room.onMessage('draft_started', (data) => {
      console.log(`Phase de draft commencée - Round ${data.round}`);
      setLoading(false);
    });

    room.onMessage('draft_pack_received', (data) => {
      console.log(`Nouveau paquet reçu - Choisissez ${data.pickCount} carte(s)`);
    });

    room.onMessage('draft_pick_confirmed', () => {
      console.log('Sélection confirmée, en attente des autres joueurs...');
    });

    room.onMessage('draft_pack_passed', () => {
      console.log('Les paquets changent de mains !');
    });

    room.onMessage('draft_complete', () => {
      console.log('Phase de draft terminée - La partie commence !');
    });

    room.onMessage('turn_changed', (data) => {
      const isMyTurn = data.currentPlayerSessionId === room.sessionId;
      console.log(
        isMyTurn 
          ? 'C\'est votre tour !' 
          : `C'est au tour de ${data.currentPseudo}`
      );
    });

    room.onMessage('card_placed', (data) => {
      const isMe = data.playerSessionId === room.sessionId;
      console.log(
        `${isMe ? 'Vous avez' : data.pseudo + ' a'} placé ${data.card.value} de ${data.card.suit}`
      );
    });

    room.onMessage('special_power_activated', (data) => {
      const isMe = data.playerSessionId === room.sessionId;
      console.log(
        `${isMe ? 'Vous avez' : data.pseudo + ' a'} activé: ${data.power}`
      );
    });

    room.onMessage('game_over', (data) => {
      console.log(
        data.winner ? 
        `Partie terminée ! Gagnant: ${data.winner}` : 
        'Partie terminée - Égalité'
      );
    });

    room.onMessage('error', (data) => {
      console.error(`Erreur: ${data.message}`);
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
        console.warn('⚠️ Connexion perdue, tentative de reconnexion...');
        // La reconnexion sera gérée automatiquement via useEffect dans App.jsx
      } else {
        // Déconnexion volontaire : nettoyer le token
        console.log('👋 Déconnexion volontaire');
        clearReconnectionToken();
      }
    });

  }, [setGameState, setLoading, setConnected, setError, setReconnectionToken, clearReconnectionToken]);

  /**
   * Reconnexion automatique
   */
  const reconnect = useCallback(async () => {
    if (!canReconnect()) {
      setError('Nombre maximum de tentatives de reconnexion atteint');
      clearReconnectionToken();
      return false;
    }

    // Vérifier si on a un token de reconnexion
    if (!hasReconnectionToken()) {
      console.warn('Aucun token de reconnexion disponible');
      setError('Impossible de se reconnecter');
      return false;
    }

    try {
      incrementReconnectAttempts();
      setReconnecting(true);
      console.log('🔄 Tentative de reconnexion...', { tentative: useConnectionStore.getState().reconnectAttempts });
      
      // Utiliser le token de reconnexion
      const room = await gameService.reconnectToRoom(roomId, reconnectionToken);
      
      if (!room) {
        throw new Error('Impossible de se reconnecter à la room');
      }

      setupRoomListeners(room);
      setConnected(true);
      setRoomId(room.id);
      setMySessionId(room.sessionId);
      setReconnecting(false);
      console.log('✅ Reconnexion réussie !');
      
      return true;
      
    } catch (err) {
      console.error('❌ Échec de la reconnexion:', err);
      setError('Échec de la reconnexion');
      setReconnecting(false);
      
      // Si la reconnexion échoue définitivement, nettoyer le token
      if (!canReconnect()) {
        clearReconnectionToken();
      }
      
      return false;
    }
  }, [
    canReconnect, 
    hasReconnectionToken,
    incrementReconnectAttempts, 
    roomId,
    reconnectionToken,
    setupRoomListeners, 
    setConnected, 
    setRoomId, 
    setMySessionId, 
    setError,
    setReconnecting,
    clearReconnectionToken,
  ]);

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
      
  console.log('Connexion établie !');
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
  console.error(`Erreur: ${errorMessage}`);
      return false;
    } finally {
      setConnecting(false);
    }
  }, [playerPseudo, setConnecting, setConnected, setError, setRoomId, setMySessionId, setupRoomListeners]);

  /**
   * Se déconnecter
   */
  const disconnect = useCallback(async () => {
    try {
      // Déconnexion volontaire (consented = true)
      await gameService.leaveRoom(true);
      setConnected(false);
      setRoomId(null);
      setError(null);
      clearReconnectionToken(); // Nettoyer le token lors d'une déconnexion volontaire
      resetGameStore();
      console.log('👋 Déconnecté volontairement');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  }, [setConnected, setRoomId, setError, clearReconnectionToken, resetGameStore]);

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
      return false;
    }
  }, []);

  return {
    connect,
    disconnect,
    reconnect,
    resetAll,
    sendMessage
  };
};
