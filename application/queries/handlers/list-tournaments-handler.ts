import { TournamentSummary } from "../../shared/models"
import { ListTournamentsQuery } from "../list-tournaments-query"
import { TournamentReadRepository } from "../ports"
import { QueryHandler } from "../query-bus"

export class ListTournamentsHandler
  implements QueryHandler<ListTournamentsQuery, TournamentSummary[]>
{
  constructor(private readonly tournamentRepository: TournamentReadRepository) {}

  async execute(query: ListTournamentsQuery): Promise<TournamentSummary[]> {
    return this.tournamentRepository.listTournaments(query.filter)
  }
}
