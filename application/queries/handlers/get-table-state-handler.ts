import { TableState } from "../../shared/models"
import { GetTableStateQuery } from "../get-table-state-query"
import { TableReadRepository } from "../ports"
import { QueryHandler } from "../query-bus"

export class GetTableStateHandler
  implements QueryHandler<GetTableStateQuery, TableState | null>
{
  constructor(private readonly tableRepository: TableReadRepository) {}

  async execute(query: GetTableStateQuery): Promise<TableState | null> {
    return this.tableRepository.getTable(query.tableId)
  }
}
