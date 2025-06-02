"use server";

import { 
  getPlayerProfileAction, 
  getAllPlayersAction, 
  getPlayerAction 
} from "@/src/presentation/adapters/nextjs/controllers/player.controller";
import { PlayerSearchDto } from "@/src/core/application/dtos/player.dto";
import { PlayerProfileDto } from "@/src/application-facade/interfaces/IPlayerFacade";

export type { PlayerProfileDto };

export async function getPlayerProfile(playerId: string) {
  return await getPlayerProfileAction(playerId);
}

export type PlayerListItem = {
  id: string;
  name: string;
  joinedDate: string;
  tournamentCount: number;
  bestFinish: number;
  totalPoints: number;
  isActive: boolean;
};

export async function getPlayers(searchTerm = "", page = 1, pageSize = 10) {
  const search: PlayerSearchDto = {
    query: searchTerm,
    page,
    pageSize,
    sortBy: 'name',
    sortOrder: 'asc'
  };
  
  return await getAllPlayersAction(search);
}

export async function getPlayerById(id: string) {
  return await getPlayerAction(id);
}
