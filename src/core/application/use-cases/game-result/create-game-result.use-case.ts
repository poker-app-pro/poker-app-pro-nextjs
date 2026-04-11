import { GameResultRepository } from "@/src/core/domain/repositories/game-result.repository";

export class CreateGameResultUseCase {
  constructor(private readonly repository: GameResultRepository) {}

  execute(payload: Record<string, unknown>) {
    return this.repository.save(payload);
  }
}
