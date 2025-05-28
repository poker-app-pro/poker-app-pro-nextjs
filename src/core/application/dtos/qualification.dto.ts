/**
 * Qualification Data Transfer Objects
 * Framework-agnostic data structures for qualification operations
 */

export interface CreateQualificationDTO {
  playerId: string;
  eventId: string; // Can be tournament, series, or season ID
  eventType: 'tournament' | 'series' | 'season';
  qualificationType: 'automatic' | 'points' | 'manual' | 'payment';
  qualificationDate: string; // ISO date string
  pointsRequired?: number;
  pointsEarned?: number;
  paymentRequired?: number;
  paymentStatus?: 'pending' | 'paid' | 'waived';
  notes?: string;
}

export interface UpdateQualificationDTO {
  id: string;
  qualificationType?: 'automatic' | 'points' | 'manual' | 'payment';
  qualificationDate?: string;
  pointsRequired?: number;
  pointsEarned?: number;
  paymentRequired?: number;
  paymentStatus?: 'pending' | 'paid' | 'waived';
  status?: 'pending' | 'qualified' | 'disqualified' | 'expired';
  notes?: string;
}

export interface QualificationDTO {
  id: string;
  playerId: string;
  playerName: string;
  eventId: string;
  eventName: string;
  eventType: 'tournament' | 'series' | 'season';
  seriesId?: string;
  seriesName?: string;
  seasonId: string;
  seasonName: string;
  leagueId: string;
  leagueName: string;
  qualificationType: 'automatic' | 'points' | 'manual' | 'payment';
  qualificationDate: string;
  expirationDate?: string;
  pointsRequired?: number;
  pointsEarned?: number;
  paymentRequired?: number;
  paymentStatus: 'pending' | 'paid' | 'waived';
  status: 'pending' | 'qualified' | 'disqualified' | 'expired';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface QualificationListDTO {
  qualifications: QualificationDTO[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface QualificationSearchDTO {
  playerId?: string;
  eventId?: string;
  eventType?: 'tournament' | 'series' | 'season';
  seriesId?: string;
  seasonId?: string;
  leagueId?: string;
  qualificationType?: 'automatic' | 'points' | 'manual' | 'payment';
  status?: 'pending' | 'qualified' | 'disqualified' | 'expired';
  paymentStatus?: 'pending' | 'paid' | 'waived';
  qualificationDateFrom?: string;
  qualificationDateTo?: string;
  expirationDateFrom?: string;
  expirationDateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'qualificationDate' | 'expirationDate' | 'playerName' | 'eventName' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface QualificationSummaryDTO {
  id: string;
  playerName: string;
  eventName: string;
  eventType: 'tournament' | 'series' | 'season';
  qualificationType: 'automatic' | 'points' | 'manual' | 'payment';
  qualificationDate: string;
  status: 'pending' | 'qualified' | 'disqualified' | 'expired';
  paymentStatus: 'pending' | 'paid' | 'waived';
}

export interface PlayerQualificationStatusDTO {
  playerId: string;
  playerName: string;
  eventId: string;
  eventName: string;
  eventType: 'tournament' | 'series' | 'season';
  isQualified: boolean;
  qualificationMethod?: 'automatic' | 'points' | 'manual' | 'payment';
  pointsRequired?: number;
  pointsEarned?: number;
  pointsNeeded?: number;
  paymentRequired?: number;
  paymentStatus?: 'pending' | 'paid' | 'waived';
  qualificationDeadline?: string;
  canQualify: boolean;
  qualificationOptions: {
    byPoints: boolean;
    byPayment: boolean;
    byManual: boolean;
  };
}

export interface QualificationHistoryDTO {
  playerId: string;
  playerName: string;
  qualifications: {
    id: string;
    eventName: string;
    eventType: 'tournament' | 'series' | 'season';
    qualificationType: 'automatic' | 'points' | 'manual' | 'payment';
    qualificationDate: string;
    status: 'pending' | 'qualified' | 'disqualified' | 'expired';
    pointsEarned?: number;
    paymentAmount?: number;
  }[];
  totalQualifications: number;
  qualifiedEvents: number;
  pendingQualifications: number;
  expiredQualifications: number;
}

export interface QualificationStatsDTO {
  eventId: string;
  eventName: string;
  eventType: 'tournament' | 'series' | 'season';
  totalQualifications: number;
  qualifiedPlayers: number;
  pendingQualifications: number;
  expiredQualifications: number;
  disqualifiedPlayers: number;
  qualificationsByType: {
    automatic: number;
    points: number;
    manual: number;
    payment: number;
  };
  paymentStats: {
    totalRequired: number;
    totalPaid: number;
    totalPending: number;
    totalWaived: number;
  };
}

export interface BulkQualificationDTO {
  eventId: string;
  eventType: 'tournament' | 'series' | 'season';
  qualificationType: 'automatic' | 'points' | 'manual' | 'payment';
  playerIds: string[];
  qualificationDate: string;
  pointsRequired?: number;
  paymentRequired?: number;
  notes?: string;
}

export interface QualificationValidationDTO {
  playerId: string;
  eventId: string;
  eventType: 'tournament' | 'series' | 'season';
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requirements: {
    pointsRequired?: number;
    pointsEarned?: number;
    paymentRequired?: number;
    paymentStatus?: 'pending' | 'paid' | 'waived';
    deadline?: string;
  };
}
