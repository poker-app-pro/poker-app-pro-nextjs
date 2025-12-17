import { Query } from "./query-bus"

export class GetTableStateQuery implements Query {
  static readonly queryName = "GetTableStateQuery"
  readonly name = GetTableStateQuery.queryName

  constructor(public readonly tableId: string) {}
}
