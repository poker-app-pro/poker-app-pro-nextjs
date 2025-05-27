import { LeagueEntity, CreateLeagueRequest, UpdateLeagueRequest } from '../entities/league.entity';

// Repository interface - part of domain layer
export interface LeagueRepository {
  findById(id: string): Promise<LeagueEntity | null>;
  findByUserId(userId: string): Promise<LeagueEntity[]>;
  findActiveLeagues(): Promise<LeagueEntity[]>;
  findAll(): Promise<LeagueEntity[]>;
  create(request: CreateLeagueRequest): Promise<LeagueEntity>;
  update(request: UpdateLeagueRequest): Promise<LeagueEntity>;
  delete(id: string): Promise<void>;
  existsById(id: string): Promise<boolean>;
  findByName(name: string, userId: string): Promise<LeagueEntity | null>;
}
