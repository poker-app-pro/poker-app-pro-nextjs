import { TableState, TournamentSummary } from "../shared/models"

export interface TableReadRepository {
  getTable(tableId: string): Promise<TableState | null>
}

export interface TournamentReadRepository {
  listTournaments(
    filter?: Partial<Pick<TournamentSummary, "leagueId" | "seriesId" | "status">>
  ): Promise<TournamentSummary[]>
}
