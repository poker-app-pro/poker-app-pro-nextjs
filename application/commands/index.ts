import { CommandBus } from "./command-bus"
import { CreateGameCommand } from "./create-game-command"
import { JoinTableCommand } from "./join-table-command"
import { CreateGameHandler } from "./handlers/create-game-handler"
import { JoinTableHandler } from "./handlers/join-table-handler"
import {
  GameWriteRepository,
  IdGenerator,
  TableMembershipWriter,
} from "./ports"

export interface CommandDependencies {
  gameRepository: GameWriteRepository
  tableMembershipWriter: TableMembershipWriter
  idGenerator: IdGenerator
}

export function registerCommandHandlers(
  commandBus: CommandBus,
  dependencies: CommandDependencies
) {
  const createGameHandler = new CreateGameHandler(
    dependencies.gameRepository,
    dependencies.idGenerator
  )
  const joinTableHandler = new JoinTableHandler(
    dependencies.tableMembershipWriter
  )

  commandBus.register(CreateGameCommand.commandName, createGameHandler)
  commandBus.register(JoinTableCommand.commandName, joinTableHandler)
}
