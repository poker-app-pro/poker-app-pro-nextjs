import { PokerGame, TableState } from "../../shared/models"
import { CommandHandler } from "../command-bus"
import { CreateGameCommand } from "../create-game-command"
import { GameWriteRepository, IdGenerator } from "../ports"

export class CreateGameHandler
  implements CommandHandler<CreateGameCommand, PokerGame>
{
  constructor(
    private readonly repository: GameWriteRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async handle(command: CreateGameCommand): Promise<PokerGame> {
    const gameId = this.idGenerator.nextId("game")
    const tables: TableState[] = Array.from(
      { length: command.payload.tableCount },
      (_, index) => {
        const tableId = this.idGenerator.nextId(`table-${index + 1}`)
        return {
          id: tableId,
          gameId,
          name: `Table ${index + 1}`,
          maxPlayers: command.payload.maxPlayersPerTable,
          players: [],
          waitlist: [],
        }
      }
    )

    const game: PokerGame = {
      id: gameId,
      name: command.payload.name,
      hostId: command.payload.hostId,
      scheduledAt: command.payload.scheduledAt,
      tableCount: command.payload.tableCount,
      maxPlayersPerTable: command.payload.maxPlayersPerTable,
      status: "pending",
      tables,
    }

    await this.repository.create(game)
    await Promise.all(tables.map((table) => this.repository.saveTable(table)))

    return game
  }
}
