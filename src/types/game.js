// Constantes et utilitaires basés sur l'API Colyseus du backend Regicide

// Constantes pour les phases de jeu
export const GAME_PHASES = {
  WAITING: 'waiting',
  DRAFTING: 'drafting', 
  PLAYING: 'playing',
  FINISHED: 'finished'
};

// Constantes pour les familles de cartes
export const SUITS = {
  HEARTS: 'hearts',
  DIAMONDS: 'diamonds',
  CLUBS: 'clubs',
  SPADES: 'spades',
};

// Constantes pour les types de cartes
export const CARD_TYPES = {
  ACE: 'ace',
  NUMBER: 'number', 
  JACK: 'jack',
  QUEEN: 'queen',
  KING: 'king'
};

// Constantes pour les valeurs de cartes
export const CARD_VALUES = {
  ACE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
  NINE: 9,
  TEN: 10,
  JACK: 11,
  QUEEN: 12,
  KING: 13,
};

// Symboles des familles
export const SUIT_SYMBOLS = {
  [SUITS.HEARTS]: '♥',
  [SUITS.DIAMONDS]: '♦',
  [SUITS.CLUBS]: '♣',
  [SUITS.SPADES]: '♠',
};

// Couleurs des familles
export const SUIT_COLORS = {
  [SUITS.HEARTS]: 'red',
  [SUITS.DIAMONDS]: 'red',
  [SUITS.CLUBS]: 'black',
  [SUITS.SPADES]: 'black',
};

// Actions de jeu
export const GAME_ACTIONS = {
  PLACE: 'place',
  REPLACE: 'replace',
  SPECIAL_POWER: 'special_power'
};

// Codes d'erreur
export const ERROR_CODES = {
  GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
  GAME_NOT_PLAYING: 'GAME_NOT_PLAYING', 
  NOT_YOUR_TURN: 'NOT_YOUR_TURN',
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
  CARD_NOT_IN_HAND: 'CARD_NOT_IN_HAND',
  INVALID_POSITION: 'INVALID_POSITION',
  INVALID_PLACEMENT: 'INVALID_PLACEMENT',
  CANNOT_REPLACE_CARD: 'CANNOT_REPLACE_CARD'
};

// Fonctions utilitaires pour créer des objets

/**
 * Crée un objet Card
 */
export const createCard = (id, value, suit, type, row = 0, col = 0, isVisible = true) => ({
  id,
  value,
  suit,
  type,
  row,
  col,
  isVisible
});

/**
 * Crée un objet Position
 */
export const createPosition = (row, col) => ({
  row,
  col
});

/**
 * Crée un objet Player
 */
export const createPlayer = (sessionId, pseudo) => ({
  sessionId,
  pseudo,
  hand: [],
  secretKing: null,
  score: 0,
  isReady: false,
  isConnected: true,
  handCount: 0,
  draftPack: [],
  hasPicked: false
});

/**
 * Crée un objet Pyramid vide
 */
export const createPyramid = () => ({
  row1: [],
  row2: [],
  row3: [],
  row4: [],
  totalCards: 0,
  emptySlots: 10
});

/**
 * Crée un état de jeu initial
 */
export const createGameState = () => ({
  phase: GAME_PHASES.WAITING,
  players: [],
  currentPlayerIndex: 0,
  pyramid: createPyramid(),
  discardPile: [],
  turn: 0,
  gameOptions: '{}',
  winner: '',
  createdAt: Date.now(),
  lastActivity: Date.now()
});

/**
 * Crée un état UI initial
 */
export const createUIState = () => ({
  selectedCard: null,
  validMoves: [],
  isDragging: false,
  selectedTargets: [],
  showChat: false
});

/**
 * Crée un état de connexion initial
 */
export const createConnectionState = () => ({
  isConnected: false,
  isConnecting: false,
  error: null,
  roomId: null,
  mySessionId: null
});
