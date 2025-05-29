/**
 * Domain Layer Exports
 * Clean Architecture - Domain Layer
 */

// Value Objects
export { Position } from '@/src/core/domain/value-objects/position';
export { Points } from '@/src/core/domain/value-objects/points';
export { GameTime } from '@/src/core/domain/value-objects/game-time';

// Entities
export { Player } from '@/src/core/domain/entities/player';
export { GameResult } from '@/src/core/domain/entities/game-result';
export { League } from '@/src/core/domain/entities/league';
export { Season } from '@/src/core/domain/entities/season';
export { Series } from '@/src/core/domain/entities/series';
export { Tournament } from '@/src/core/domain/entities/tournament';
export { Qualification } from '@/src/core/domain/entities/qualification';
export { Scoreboard } from '@/src/core/domain/entities/scoreboard';

// Domain Services
export * from '@/src/core/domain/services/scoring-strategy';

// Repository Interfaces
export * from '@/src/core/domain/repositories/player.repository';
export * from '@/src/core/domain/repositories/game-result.repository';
export * from '@/src/core/domain/repositories/league.repository';
export * from '@/src/core/domain/repositories/season.repository';
export * from '@/src/core/domain/repositories/series.repository';
export * from '@/src/core/domain/repositories/tournament.repository';
export * from '@/src/core/domain/repositories/qualification.repository';
export * from '@/src/core/domain/repositories/scoreboard.repository';
