// Application Layer - Score Game Use Case
import type { GameResult } from "@/src/core/domain/entities/game-result.entity"
import { GameType } from "@/src/core/domain/entities/game-result.entity"
import type { ScoringStrategy } from "@/src/core/domain/services/scoring-strategy.service"
import { TournamentScoringStrategy, ConsolationScoringStrategy } from "@/src/core/domain/services/scoring-strategy.service"

export class ScoreGameUseCase {
  private strategies: Map<GameType, ScoringStrategy>

  constructor() {
    this.strategies = new Map<GameType, ScoringStrategy>([
      [GameType.Tournament, new TournamentScoringStrategy()],
      [GameType.Consolation, new ConsolationScoringStrategy()]
    ])
  }

  execute(gameResult: GameResult): Map<string, number> {
    const strategy = this.strategies.get(gameResult.gameType)
    if (!strategy) {
      throw new Error(`No scoring strategy for game type: ${gameResult.gameType}`)
    }
    return strategy.calculatePoints(gameResult)
  }
}

// Export singleton instance
export const scoreGameUseCase = new ScoreGameUseCase()
