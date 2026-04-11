import { randomUUID } from "crypto";
import { GameResultRepository } from "../../core/domain/repositories/game-result.repository";

export class AmplifyGameResultRepository implements GameResultRepository {
  async save(result: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Placeholder implementation; replace with Amplify data call when available.
    return { ...result, id: randomUUID() };
  }
}
