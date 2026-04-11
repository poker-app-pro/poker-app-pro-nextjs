import { PlayerRepository } from "@/src/core/domain/repositories/player.repository";

export class SearchPlayersUseCase {
  constructor(private readonly repository: PlayerRepository) {}

  execute(term: string) {
    return this.repository.findByNameTerm(term);
  }
}
