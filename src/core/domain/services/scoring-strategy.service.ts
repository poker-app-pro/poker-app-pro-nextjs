// Core Domain Layer - Scoring Strategy Service
import type { GameResult } from "../entities/game-result.entity"

export interface ScoringStrategy {
  calculatePoints(gameResult: GameResult): Map<string, number>
}

export class TournamentScoringStrategy implements ScoringStrategy {
  calculatePoints(gameResult: GameResult): Map<string, number> {
    const points = new Map<string, number>()
    // Sort results by rank
    const sorted = [...gameResult.results].sort((a, b) => a.rank - b.rank)
    let i = 0
    while (i < sorted.length) {
      const currentRank = sorted[i].rank
      const tiedPlayers = sorted.filter(p => p.rank === currentRank)
      const pointValue = gameResult.totalPlayers * (11 - currentRank)
      for (const p of tiedPlayers) {
        if (currentRank <= 10) {
          points.set(p.playerId, pointValue)
        }
      }
      i += tiedPlayers.length
    }
    return points
  }
}

export class ConsolationScoringStrategy implements ScoringStrategy {
  calculatePoints(gameResult: GameResult): Map<string, number> {
    const fixedPoints = [100, 50, 25]
    const points = new Map<string, number>()
    const sorted = [...gameResult.results].sort((a, b) => a.rank - b.rank)
    let i = 0
    while (i < sorted.length) {
      const currentRank = sorted[i].rank
      if (currentRank > 3) break
      const tiedPlayers = sorted.filter(p => p.rank === currentRank)
      for (const p of tiedPlayers) {
        points.set(p.playerId, fixedPoints[currentRank - 1])
      }
      i += tiedPlayers.length
    }
    return points
  }
}
