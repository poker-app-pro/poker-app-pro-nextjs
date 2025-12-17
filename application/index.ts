import { CommandBus } from "./commands/command-bus"
import { registerCommandHandlers } from "./commands"
import { QueryBus } from "./queries/query-bus"
import { registerQueryHandlers } from "./queries"
import { InMemoryIdGenerator, InMemoryPokerRepository } from "./state/in-memory-poker-repository"

const commandBus = new CommandBus()
const queryBus = new QueryBus()

const repository = new InMemoryPokerRepository()
const idGenerator = new InMemoryIdGenerator()

registerCommandHandlers(commandBus, {
  gameRepository: repository,
  tableMembershipWriter: repository,
  idGenerator,
})

registerQueryHandlers(queryBus, {
  tableRepository: repository,
  tournamentRepository: repository,
})

export { commandBus, queryBus, repository, idGenerator }
