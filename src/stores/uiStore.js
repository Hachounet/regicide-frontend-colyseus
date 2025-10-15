import { create } from 'zustand';

const initialState = {
  selectedCard: null,
  validMoves: [],
  hoveredPosition: null,
  isDragging: false,
  draggedCard: null,
  isSelectingTargets: false,
  selectedTargets: [],
  maxTargets: 0,
  showChat: false,
  notifications: [],
  isLoading: false,
  showRules: false,
  showSettings: false,
};

export const useUIStore = create((set, get) => ({
  ...initialState,

  // Actions de sélection
  selectCard: (card) => {
    set({ selectedCard: card });
    if (!card) {
      set({ validMoves: [] });
    }
  },

  setValidMoves: (moves) => {
    set({ validMoves: moves });
  },

  setHoveredPosition: (position) => {
    set({ hoveredPosition: position });
  },

  // Actions de drag & drop
  startDragging: (card) => {
    set({ 
      isDragging: true, 
      draggedCard: card,
      selectedCard: card 
    });
  },

  stopDragging: () => {
    set({ 
      isDragging: false, 
      draggedCard: null 
    });
  },

  // Actions pour pouvoirs spéciaux
  startSelectingTargets: (maxTargets) => {
    set({ 
      isSelectingTargets: true, 
      maxTargets,
      selectedTargets: [] 
    });
  },

  toggleTarget: (position) => {
    const { selectedTargets, maxTargets } = get();
    
    // Vérifier si la position est déjà sélectionnée
    const existingIndex = selectedTargets.findIndex(
      t => t.row === position.row && t.col === position.col
    );
    
    if (existingIndex >= 0) {
      // Désélectionner
      set({
        selectedTargets: selectedTargets.filter((_, i) => i !== existingIndex)
      });
    } else if (selectedTargets.length < maxTargets) {
      // Sélectionner si on n'a pas atteint le max
      set({
        selectedTargets: [...selectedTargets, position]
      });
    }
  },

  clearTargets: () => {
    set({ selectedTargets: [] });
  },

  stopSelectingTargets: () => {
    set({ 
      isSelectingTargets: false, 
      selectedTargets: [], 
      maxTargets: 0 
    });
  },

  // Actions d'interface
  toggleChat: () => {
    set({ showChat: !get().showChat });
  },

  addNotification: (message) => {
    const { notifications } = get();
    set({ notifications: [...notifications, message] });
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
      const currentNotifications = get().notifications;
      const index = currentNotifications.indexOf(message);
      if (index >= 0) {
        get().removeNotification(index);
      }
    }, 5000);
  },

  removeNotification: (index) => {
    const { notifications } = get();
    set({ 
      notifications: notifications.filter((_, i) => i !== index) 
    });
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // Actions de modales
  toggleRules: () => {
    set({ showRules: !get().showRules });
  },

  toggleSettings: () => {
    set({ showSettings: !get().showSettings });
  },

  // Reset
  reset: () => {
    set(initialState);
  },
}));
