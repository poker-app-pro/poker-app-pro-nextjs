import { Query } from "./query-bus"

export interface ListTournamentsFilter {
  leagueId?: string
  seriesId?: string
  status?: "scheduled" | "active" | "completed"
}

export class ListTournamentsQuery implements Query {
  static readonly queryName = "ListTournamentsQuery"
  readonly name = ListTournamentsQuery.queryName

  constructor(public readonly filter: ListTournamentsFilter = {}) {}
}
