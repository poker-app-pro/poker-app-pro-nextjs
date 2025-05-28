// Core Domain Layer - Game Result Entity
export enum GameType {
  Tournament = "Tournament",
  Consolation = "Consolation"
}

export interface PlayerResult {
  playerId: string
  rank: number
}

export interface GameResult {
  gameType: GameType
  totalPlayers: number
  results: PlayerResult[]
}
