import { Schema, MapSchema, ArraySchema } from '@colyseus/schema';

// Schéma pour une carte
export class CardSchema extends Schema {
  // Pas besoin de @type côté client dans certains cas
  // Le serveur définit la structure
}

// Schéma pour un joueur
export class PlayerSchema extends Schema {
  // Structure définie par le serveur
}

// Schéma pour une position dans la pyramide
export class PositionSchema extends Schema {
  // Structure définie par le serveur
}

// Schéma principal du jeu Regicide
export class RegicideGameState extends Schema {
  // Structure définie par le serveur
  // Le client recevra les types automatiquement
}

// Export par défaut du schéma principal
export default RegicideGameState;
