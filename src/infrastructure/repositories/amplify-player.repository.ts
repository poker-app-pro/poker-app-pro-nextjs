import { PlayerRepository } from "@/src/core/domain/repositories/player.repository";

export class AmplifyPlayerRepository implements PlayerRepository {
  async findByNameTerm(term: string): Promise<string[]> {
    if (!term) return [];
    // Placeholder implementation; replace with Amplify data call when available.
    return [`Mock player for term "${term}"`];
  }
}
