import { PokerGame, TableState } from "../shared/models"

export interface IdGenerator {
  nextId(prefix?: string): string
}

export interface GameWriteRepository {
  create(game: PokerGame): Promise<void>
  saveTable(table: TableState): Promise<void>
}

export interface TableMembershipWriter {
  addPlayer(tableId: string, playerId: string): Promise<TableState | null>
}
