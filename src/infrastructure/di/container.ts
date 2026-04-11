import { CalculatePointsUseCase } from "@/src/core/application/use-cases/game-result/calculate-points.use-case";
import { CreateGameResultUseCase } from "@/src/core/application/use-cases/game-result/create-game-result.use-case";
import { SearchPlayersUseCase } from "@/src/core/application/use-cases/player/search-players.use-case";
import { AmplifyGameResultRepository } from "../repositories/amplify-game-result.repository";
import { AmplifyPlayerRepository } from "../repositories/amplify-player.repository";

export interface AppContainer {
  searchPlayersUseCase: SearchPlayersUseCase;
  createGameResultUseCase: CreateGameResultUseCase;
  calculatePointsUseCase: CalculatePointsUseCase;
}

export function buildContainer(): AppContainer {
  const playerRepository = new AmplifyPlayerRepository();
  const gameResultRepository = new AmplifyGameResultRepository();

  return {
    searchPlayersUseCase: new SearchPlayersUseCase(playerRepository),
    createGameResultUseCase: new CreateGameResultUseCase(gameResultRepository),
    calculatePointsUseCase: new CalculatePointsUseCase(),
  };
}
