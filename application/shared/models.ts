export interface PokerGame {
  id: string
  name: string
  hostId: string
  scheduledAt: string
  tableCount: number
  maxPlayersPerTable: number
  status: "pending" | "active" | "completed"
  tables: TableState[]
}

export interface TableState {
  id: string
  gameId: string
  name: string
  maxPlayers: number
  players: string[]
  waitlist: string[]
}

export interface TournamentSummary {
  id: string
  name: string
  leagueId?: string
  seriesId?: string
  scheduledAt: string
  status: "scheduled" | "active" | "completed"
}
