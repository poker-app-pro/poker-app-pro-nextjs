import { GameWriteRepository, IdGenerator, TableMembershipWriter } from "../commands/ports"
import { TableReadRepository, TournamentReadRepository } from "../queries/ports"
import { PokerGame, TableState, TournamentSummary } from "../shared/models"

export class InMemoryIdGenerator implements IdGenerator {
  private counter = 0

  nextId(prefix = "id"): string {
    this.counter += 1
    return `${prefix}-${this.counter}`
  }
}

export class InMemoryPokerRepository
  implements
    GameWriteRepository,
    TableMembershipWriter,
    TableReadRepository,
    TournamentReadRepository
{
  private games = new Map<string, PokerGame>()
  private tables = new Map<string, TableState>()
  private tournaments = new Map<string, TournamentSummary>()

  constructor(seed?: {
    games?: PokerGame[]
    tables?: TableState[]
    tournaments?: TournamentSummary[]
  }) {
    seed?.games?.forEach((game) => this.games.set(game.id, game))
    seed?.tables?.forEach((table) => this.tables.set(table.id, table))
    seed?.tournaments?.forEach((tournament) =>
      this.tournaments.set(tournament.id, tournament)
    )
  }

  async create(game: PokerGame): Promise<void> {
    this.games.set(game.id, game)
  }

  async saveTable(table: TableState): Promise<void> {
    this.tables.set(table.id, table)
  }

  async addPlayer(
    tableId: string,
    playerId: string
  ): Promise<TableState | null> {
    const table = this.tables.get(tableId)

    if (!table) {
      return null
    }

    const hasSpace = table.players.length < table.maxPlayers

    if (table.players.includes(playerId) || table.waitlist.includes(playerId)) {
      return table
    }

    if (hasSpace) {
      table.players = [...table.players, playerId]
    } else {
      table.waitlist = [...table.waitlist, playerId]
    }

    this.tables.set(tableId, { ...table })
    return this.tables.get(tableId) ?? null
  }

  async getTable(tableId: string): Promise<TableState | null> {
    return this.tables.get(tableId) ?? null
  }

  async listTournaments(filter = {}): Promise<TournamentSummary[]> {
    const tournaments = Array.from(this.tournaments.values())

    return tournaments.filter((tournament) => {
      if (filter.leagueId && tournament.leagueId !== filter.leagueId) {
        return false
      }

      if (filter.seriesId && tournament.seriesId !== filter.seriesId) {
        return false
      }

      if (filter.status && tournament.status !== filter.status) {
        return false
      }

      return true
    })
  }
}
