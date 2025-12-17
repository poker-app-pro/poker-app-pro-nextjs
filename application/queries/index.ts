import { GetTableStateHandler } from "./handlers/get-table-state-handler"
import { ListTournamentsHandler } from "./handlers/list-tournaments-handler"
import { GetTableStateQuery } from "./get-table-state-query"
import { ListTournamentsQuery } from "./list-tournaments-query"
import { TableReadRepository, TournamentReadRepository } from "./ports"
import { QueryBus } from "./query-bus"

export interface QueryDependencies {
  tableRepository: TableReadRepository
  tournamentRepository: TournamentReadRepository
}

export function registerQueryHandlers(
  queryBus: QueryBus,
  dependencies: QueryDependencies
) {
  const getTableStateHandler = new GetTableStateHandler(
    dependencies.tableRepository
  )
  const listTournamentsHandler = new ListTournamentsHandler(
    dependencies.tournamentRepository
  )

  queryBus.register(GetTableStateQuery.queryName, getTableStateHandler)
  queryBus.register(ListTournamentsQuery.queryName, listTournamentsHandler)
}
