import { SearchPlayersUseCase } from "../../../core/application/use-cases/player/search-players.use-case";
import { CalculatePointsUseCase } from "../../../core/application/use-cases/game-result/calculate-points.use-case";
import { CreateGameResultUseCase } from "../../../core/application/use-cases/game-result/create-game-result.use-case";

const mockFindByNameTerm = jest.fn().mockResolvedValue([]);
const mockSave = jest.fn().mockResolvedValue({ id: "test" });

jest.mock("../../repositories/amplify-player.repository", () => ({
  AmplifyPlayerRepository: jest.fn().mockImplementation(() => ({
    findByNameTerm: mockFindByNameTerm,
  })),
}));

jest.mock("../../repositories/amplify-game-result.repository", () => ({
  AmplifyGameResultRepository: jest.fn().mockImplementation(() => ({
    save: mockSave,
  })),
}));

import { AmplifyGameResultRepository } from "../../repositories/amplify-game-result.repository";
import { AmplifyPlayerRepository } from "../../repositories/amplify-player.repository";
import { buildContainer } from "../container";

describe("container", () => {
  it("wires use cases with mocked repositories", async () => {
    const container = buildContainer();

    expect(container.searchPlayersUseCase).toBeInstanceOf(SearchPlayersUseCase);
    expect(container.createGameResultUseCase).toBeInstanceOf(
      CreateGameResultUseCase,
    );
    expect(container.calculatePointsUseCase).toBeInstanceOf(
      CalculatePointsUseCase,
    );

    await container.searchPlayersUseCase.execute("john");
    await container.createGameResultUseCase.execute({ winner: "john" });

    expect(AmplifyPlayerRepository).toHaveBeenCalledTimes(1);
    expect(AmplifyGameResultRepository).toHaveBeenCalledTimes(1);
    expect(mockFindByNameTerm).toHaveBeenCalledWith("john");
    expect(mockSave).toHaveBeenCalledWith({ winner: "john" });
  });
});
