import React, { useEffect, useState } from 'react';
import { useConnectionStore } from '../../stores/connectionStore';
import { useGameConnection } from '../../hooks/useGameConnection';

/**
 * Composant pour afficher les notifications de reconnexion
 */
const ReconnectionNotification = () => {
  const { 
    isConnected, 
    error, 
    isReconnecting, 
    reconnectAttempts,
    maxReconnectAttempts,
    hasReconnectionToken,
  } = useConnectionStore();
  
  const { reconnect } = useGameConnection();
  const [autoReconnectTimer, setAutoReconnectTimer] = useState(null);

  // Tentative de reconnexion automatique
  useEffect(() => {
    if (!isConnected && error && hasReconnectionToken() && !isReconnecting) {
      // Attendre 2 secondes avant de tenter une reconnexion automatique
      const timer = setTimeout(() => {
        console.log('🔄 Tentative de reconnexion automatique...');
        reconnect();
      }, 2000);

      setAutoReconnectTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [isConnected, error, hasReconnectionToken, isReconnecting, reconnect]);

  // Ne rien afficher si connecté ou pas de problème
  if (isConnected || (!error && !isReconnecting)) {
    return null;
  }

  // Ne rien afficher si pas de token de reconnexion
  if (!hasReconnectionToken()) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4">
      <div className="bg-yellow-600 bg-opacity-95 text-white rounded-lg shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isReconnecting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <div>
                <p className="font-semibold">Reconnexion en cours...</p>
                <p className="text-sm">
                  Tentative {reconnectAttempts}/{maxReconnectAttempts}
                </p>
              </div>
            </>
          ) : (
            <>
              <svg 
                className="h-5 w-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <div>
                <p className="font-semibold">Connexion perdue</p>
                <p className="text-sm">Tentative de reconnexion automatique...</p>
              </div>
            </>
          )}
        </div>
        
        {!isReconnecting && (
          <button
            onClick={() => {
              if (autoReconnectTimer) clearTimeout(autoReconnectTimer);
              reconnect();
            }}
            className="bg-white text-yellow-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-50 transition-colors"
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
};

export default ReconnectionNotification;
