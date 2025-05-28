/**
 * Tournament Data Transfer Objects
 * Framework-agnostic data structures for tournament operations
 */

export interface CreateTournamentDTO {
  name: string;
  description?: string;
  seriesId: string;
  scheduledDate: string; // ISO date string
  scheduledTime: string; // ISO time string
  buyInAmount: number;
  maxPlayers?: number;
  blindStructure?: {
    levels: {
      level: number;
      smallBlind: number;
      bigBlind: number;
      ante?: number;
      duration: number; // minutes
    }[];
  };
  payoutStructure?: {
    positions: {
      position: number;
      percentage: number;
    }[];
  };
  settings?: {
    allowLateRegistration?: boolean;
    lateRegistrationMinutes?: number;
    rebuyAllowed?: boolean;
    rebuyCount?: number;
    rebuyAmount?: number;
    addonAllowed?: boolean;
    addonAmount?: number;
    startingChips?: number;
  };
}

export interface UpdateTournamentDTO {
  id: string;
  name?: string;
  description?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  buyInAmount?: number;
  maxPlayers?: number;
  status?: 'scheduled' | 'registration' | 'active' | 'completed' | 'cancelled';
  blindStructure?: {
    levels: {
      level: number;
      smallBlind: number;
      bigBlind: number;
      ante?: number;
      duration: number;
    }[];
  };
  payoutStructure?: {
    positions: {
      position: number;
      percentage: number;
    }[];
  };
  settings?: {
    allowLateRegistration?: boolean;
    lateRegistrationMinutes?: number;
    rebuyAllowed?: boolean;
    rebuyCount?: number;
    rebuyAmount?: number;
    addonAllowed?: boolean;
    addonAmount?: number;
    startingChips?: number;
  };
}

export interface TournamentDTO {
  id: string;
  name: string;
  description?: string;
  seriesId: string;
  seriesName: string;
  seasonId: string;
  seasonName: string;
  leagueId: string;
  leagueName: string;
  scheduledDate: string;
  scheduledTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  buyInAmount: number;
  maxPlayers?: number;
  registeredPlayers: number;
  status: 'scheduled' | 'registration' | 'active' | 'completed' | 'cancelled';
  blindStructure: {
    levels: {
      level: number;
      smallBlind: number;
      bigBlind: number;
      ante?: number;
      duration: number;
    }[];
  };
  payoutStructure: {
    positions: {
      position: number;
      percentage: number;
    }[];
  };
  settings: {
    allowLateRegistration: boolean;
    lateRegistrationMinutes: number;
    rebuyAllowed: boolean;
    rebuyCount: number;
    rebuyAmount: number;
    addonAllowed: boolean;
    addonAmount: number;
    startingChips: number;
  };
  prizePool: number;
  totalRebuys: number;
  totalAddons: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface TournamentListDTO {
  tournaments: TournamentDTO[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface TournamentSearchDTO {
  seriesId?: string;
  seasonId?: string;
  leagueId?: string;
  name?: string;
  status?: 'scheduled' | 'registration' | 'active' | 'completed' | 'cancelled';
  scheduledDateFrom?: string;
  scheduledDateTo?: string;
  buyInAmountMin?: number;
  buyInAmountMax?: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'scheduledDate' | 'buyInAmount' | 'registeredPlayers' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TournamentSummaryDTO {
  id: string;
  name: string;
  seriesName: string;
  seasonName: string;
  leagueName: string;
  scheduledDate: string;
  scheduledTime: string;
  buyInAmount: number;
  registeredPlayers: number;
  maxPlayers?: number;
  status: 'scheduled' | 'registration' | 'active' | 'completed' | 'cancelled';
  prizePool: number;
}

export interface TournamentRegistrationDTO {
  tournamentId: string;
  playerId: string;
  playerName: string;
  registrationTime: string;
  seatNumber?: number;
  hasPaid: boolean;
  rebuysUsed: number;
  addonUsed: boolean;
  isActive: boolean;
}

export interface TournamentResultDTO {
  tournamentId: string;
  playerId: string;
  playerName: string;
  finalPosition: number;
  chipCount: number;
  winnings: number;
  rebuysUsed: number;
  addonUsed: boolean;
  knockouts: number;
  playTime: number; // minutes
}

export interface TournamentStatsDTO {
  id: string;
  name: string;
  totalPlayers: number;
  totalPrizePool: number;
  averageChipCount: number;
  totalRebuys: number;
  totalAddons: number;
  duration: number; // minutes
  winner?: {
    playerId: string;
    playerName: string;
    winnings: number;
  };
  topFinishers: TournamentResultDTO[];
}
