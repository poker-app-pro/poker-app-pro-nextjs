import { IPlayerFacade, PlayerProfileDto } from '../interfaces/IPlayerFacade';
import { 
  PlayerResponseDto, 
  PlayerListDto, 
  PlayerSearchDto, 
  CreatePlayerDto, 
  UpdatePlayerDto 
} from '@/src/core/application/dtos/player.dto';
import { cookieBasedClient } from '@/lib/amplify-utils';

/**
 * Player Facade Implementation
 * Implements the IPlayerFacade interface using Amplify DataStore
 */
export class PlayerFacade implements IPlayerFacade {
  /**
   * Create a new player
   */
  async createPlayer(data: CreatePlayerDto): Promise<{ success: boolean; data?: PlayerResponseDto; error?: string }> {
    try {
      const result = await cookieBasedClient.models.Player.create(
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
          profileImageUrl: data.profileImageUrl,
          notes: data.notes,
          isActive: true,
          joinDate: new Date().toISOString(),
        },
        {
          authMode: 'userPool',
        }
      );

      if (!result.data) {
        return { success: false, error: 'Failed to create player' };
      }

      return {
        success: true,
        data: {
          id: result.data.id,
          name: result.data.name,
          email: result.data.email || '',
          phone: result.data.phone || '',
          profileImageUrl: result.data.profileImageUrl || '',
          notes: result.data.notes || '',
          isActive: result.data.isActive || false,
          joinDate: result.data.joinDate || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error creating player:', error);
      return { success: false, error: 'Failed to create player' };
    }
  }

  /**
   * Update an existing player
   */
  async updatePlayer(data: UpdatePlayerDto): Promise<{ success: boolean; data?: PlayerResponseDto; error?: string }> {
    try {
      // First check if the player exists
      const existingPlayer = await cookieBasedClient.models.Player.get(
        { id: data.id },
        { authMode: 'userPool' }
      );

      if (!existingPlayer.data) {
        return { success: false, error: 'Player not found' };
      }

      // Update the player
      const result = await cookieBasedClient.models.Player.update(
        {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          profileImageUrl: data.profileImageUrl,
          notes: data.notes,
          isActive: data.isActive,
        },
        {
          authMode: 'userPool',
        }
      );

      if (!result.data) {
        return { success: false, error: 'Failed to update player' };
      }

      return {
        success: true,
        data: {
          id: result.data.id,
          name: result.data.name,
          email: result.data.email || '',
          phone: result.data.phone || '',
          profileImageUrl: result.data.profileImageUrl || '',
          notes: result.data.notes || '',
          isActive: result.data.isActive || false,
          joinDate: result.data.joinDate || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error updating player:', error);
      return { success: false, error: 'Failed to update player' };
    }
  }

  /**
   * Delete a player
   */
  async deletePlayer(id: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if the player exists
      const existingPlayer = await cookieBasedClient.models.Player.get(
        { id },
        { authMode: 'userPool' }
      );

      if (!existingPlayer.data) {
        return { success: false, error: 'Player not found' };
      }

      // Delete the player
      await cookieBasedClient.models.Player.delete(
        { id },
        { authMode: 'userPool' }
      );

      // Log the activity
      await cookieBasedClient.models.ActivityLog.create(
        {
          userId,
          action: 'DELETE',
          entityType: 'Player',
          entityId: id,
          details: { name: existingPlayer.data.name },
          timestamp: new Date().toISOString(),
        },
        {
          authMode: 'userPool',
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error deleting player:', error);
      return { success: false, error: 'Failed to delete player' };
    }
  }

  /**
   * Get a player by ID
   */
  async getPlayer(id: string): Promise<{ success: boolean; data?: PlayerResponseDto; error?: string }> {
    try {
      const result = await cookieBasedClient.models.Player.get(
        { id },
        { authMode: 'userPool' }
      );

      if (!result.data) {
        return { success: false, error: 'Player not found' };
      }

      return {
        success: true,
        data: {
          id: result.data.id,
          name: result.data.name,
          email: result.data.email || '',
          phone: result.data.phone || '',
          profileImageUrl: result.data.profileImageUrl || '',
          notes: result.data.notes || '',
          isActive: result.data.isActive || false,
          joinDate: result.data.joinDate || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error getting player:', error);
      return { success: false, error: 'Failed to get player' };
    }
  }

  /**
   * Get all players
   */
  async getAllPlayers(search?: PlayerSearchDto): Promise<{ success: boolean; data?: PlayerListDto; error?: string }> {
    try {
      // Build filter based on search parameters
      let filter: any = {};
      
      if (search) {
        const conditions = [];
        
        if (search.query) {
          conditions.push({
            name: { contains: search.query },
          });
        }
        
        if (search.isActive !== undefined) {
          conditions.push({
            isActive: { eq: search.isActive },
          });
        }
        
        if (search.joinedAfter) {
          conditions.push({
            joinDate: { ge: search.joinedAfter },
          });
        }
        
        if (search.joinedBefore) {
          conditions.push({
            joinDate: { le: search.joinedBefore },
          });
        }
        
        if (conditions.length > 0) {
          filter = { and: conditions };
        }
      }

      // Get all players
      const result = await cookieBasedClient.models.Player.list(
        filter ? { filter } : undefined,
        { authMode: 'userPool' }
      );

      if (!result.data) {
        return { success: false, error: 'Failed to get players' };
      }

      // Map to DTOs
      const players = result.data.map(player => ({
        id: player.id,
        name: player.name,
        email: player.email || '',
        phone: player.phone || '',
        profileImageUrl: player.profileImageUrl || '',
        notes: player.notes || '',
        isActive: player.isActive || false,
        joinDate: player.joinDate || new Date().toISOString(),
      }));

      // Sort players if requested
      if (search?.sortBy) {
        const sortOrder = search.sortOrder === 'desc' ? -1 : 1;
        players.sort((a, b) => {
          if (search.sortBy === 'name') {
            return sortOrder * a.name.localeCompare(b.name);
          } else if (search.sortBy === 'joinDate') {
            return sortOrder * (new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
          }
          return 0;
        });
      }

      // Apply pagination if requested
      const page = search?.page || 1;
      const pageSize = search?.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const paginatedPlayers = players.slice(startIndex, startIndex + pageSize);

      return {
        success: true,
        data: {
          players: paginatedPlayers,
          total: players.length,
          page,
          pageSize,
        },
      };
    } catch (error) {
      console.error('Error getting players:', error);
      return { success: false, error: 'Failed to get players' };
    }
  }

  /**
   * Get player profile with detailed statistics
   */
  async getPlayerProfile(id: string): Promise<{ success: boolean; data?: PlayerProfileDto; error?: string }> {
    try {
      // Get player details
      const playerResult = await cookieBasedClient.models.Player.get(
        { id },
        { authMode: 'userPool' }
      );

      if (!playerResult.data) {
        return { success: false, error: 'Player not found' };
      }

      const player = playerResult.data;

      // Get tournament results for this player
      const tournamentPlayersResult = await cookieBasedClient.models.TournamentPlayer.list(
        {
          filter: {
            playerId: { eq: id },
          },
        },
        { authMode: 'userPool' }
      );

      const tournamentPlayers = tournamentPlayersResult.data || [];

      // Get tournament details for each tournament player
      const tournamentResults = await Promise.all(
        tournamentPlayers.map(async (tp) => {
          const tournamentResult = await cookieBasedClient.models.Tournament.get(
            { id: tp.tournamentId },
            { authMode: 'userPool' }
          );
          const tournament = tournamentResult.data;

          if (!tournament) {
            return null;
          }

          // Get series details
          const seriesResult = await cookieBasedClient.models.Series.get(
            { id: tournament.seriesId },
            { authMode: 'userPool' }
          );
          const series = seriesResult.data;

          // Get season details
          const seasonResult = series
            ? await cookieBasedClient.models.Season.get(
                { id: series.seasonId },
                { authMode: 'userPool' }
              )
            : null;
          const season = seasonResult?.data;

          return {
            id: tp.id,
            tournamentId: tp.tournamentId,
            tournamentName: tournament.name,
            seriesId: tournament.seriesId,
            seriesName: series?.name || 'Unknown Series',
            seasonId: series?.seasonId || '',
            seasonName: season?.name || 'Unknown Season',
            date: tournament.date,
            finalPosition: tp.finalPosition || 0,
            points: tp.points || 0,
            bountyPoints: tp.bountyPoints || 0,
            consolationPoints: tp.consolationPoints || 0,
            totalPoints: (tp.points || 0) + (tp.bountyPoints || 0) + (tp.consolationPoints || 0),
            bountyCount: tp.bountyCount || 0,
            isConsolation: tp.isConsolation || false,
          };
        })
      );

      // Filter out null results
      const validTournamentResults = tournamentResults.filter(
        (result): result is NonNullable<typeof result> => result !== null
      );

      // Get scoreboards for this player
      const scoreboardsResult = await cookieBasedClient.models.Scoreboard.list(
        {
          filter: {
            playerId: { eq: id },
          },
        },
        { authMode: 'userPool' }
      );

      const scoreboards = scoreboardsResult.data || [];

      // Get series and season details for each scoreboard
      const seriesScoreboards = await Promise.all(
        scoreboards.map(async (scoreboard) => {
          const seriesResult = await cookieBasedClient.models.Series.get(
            { id: scoreboard.seriesId },
            { authMode: 'userPool' }
          );
          const series = seriesResult.data;

          const seasonResult = series
            ? await cookieBasedClient.models.Season.get(
                { id: series.seasonId },
                { authMode: 'userPool' }
              )
            : null;
          const season = seasonResult?.data;

          return {
            id: scoreboard.id,
            seriesId: scoreboard.seriesId,
            seriesName: series?.name || 'Unknown Series',
            seasonId: series?.seasonId || '',
            seasonName: season?.name || 'Unknown Season',
            tournamentCount: scoreboard.tournamentCount || 0,
            bestFinish: scoreboard.bestFinish || 0,
            totalPoints: scoreboard.totalPoints || 0,
            regularPoints: scoreboard.regularPoints || 0,
            bountyPoints: scoreboard.bountyPoints || 0,
            consolationPoints: scoreboard.consolationPoints || 0,
            bountyCount: scoreboard.bountyCount || 0,
            consolationCount: scoreboard.consolationCount || 0,
          };
        })
      );

      // Get qualifications for this player
      const qualificationsResult = await cookieBasedClient.models.Qualification.list(
        {
          filter: {
            playerId: { eq: id },
          },
        },
        { authMode: 'userPool' }
      );

      const qualifications = (qualificationsResult.data || []).map((q) => ({
        id: q.id,
        seasonEventName: q.seasonEventName || 'Unknown Event',
        chipCount: q.chipCount || 0,
        qualified: q.qualified || false,
        finalPosition: q.finalPosition || null,
      }));

      // Calculate overall stats
      const totalTournaments = validTournamentResults.length;
      const totalWins = validTournamentResults.filter((tr) => tr.finalPosition === 1).length;
      const totalPoints = validTournamentResults.reduce((sum, tr) => sum + tr.totalPoints, 0);
      const bestFinish = validTournamentResults.length > 0
        ? Math.min(...validTournamentResults.map((tr) => tr.finalPosition))
        : 0;
      const regularPoints = validTournamentResults.reduce(
        (sum, tr) => sum + (tr.points - tr.bountyPoints - tr.consolationPoints),
        0
      );
      const bountyPoints = validTournamentResults.reduce((sum, tr) => sum + tr.bountyPoints, 0);
      const consolationPoints = validTournamentResults.reduce(
        (sum, tr) => sum + tr.consolationPoints,
        0
      );
      const bountyCount = validTournamentResults.reduce((sum, tr) => sum + tr.bountyCount, 0);
      const consolationCount = validTournamentResults.filter((tr) => tr.isConsolation).length;

      return {
        success: true,
        data: {
          player: {
            id: player.id,
            name: player.name,
            email: player.email || '',
            phone: player.phone || '',
            profileImageUrl: player.profileImageUrl || '',
            notes: player.notes || '',
            isActive: player.isActive || false,
            joinDate: player.joinDate || new Date().toISOString(),
          },
          stats: {
            totalTournaments,
            totalWins,
            totalPoints,
            bestFinish,
            regularPoints,
            bountyPoints,
            consolationPoints,
            bountyCount,
            consolationCount,
          },
          tournamentResults: validTournamentResults,
          seriesScoreboards,
          qualifications,
        },
      };
    } catch (error) {
      console.error('Error getting player profile:', error);
      return { success: false, error: 'Failed to get player profile' };
    }
  }

  /**
   * Search players by name
   */
  async searchPlayers(searchTerm: string): Promise<{ success: boolean; data?: PlayerResponseDto[]; error?: string }> {
    try {
      const result = await cookieBasedClient.models.Player.list(
        {
          filter: {
            name: { contains: searchTerm },
          },
        },
        { authMode: 'userPool' }
      );

      if (!result.data) {
        return { success: false, error: 'Failed to search players' };
      }

      // Map to DTOs
      const players = result.data.map(player => ({
        id: player.id,
        name: player.name,
        email: player.email || '',
        phone: player.phone || '',
        profileImageUrl: player.profileImageUrl || '',
        notes: player.notes || '',
        isActive: player.isActive || false,
        joinDate: player.joinDate || new Date().toISOString(),
      }));

      return {
        success: true,
        data: players,
      };
    } catch (error) {
      console.error('Error searching players:', error);
      return { success: false, error: 'Failed to search players' };
    }
  }

  /**
   * Check if player exists
   */
  async playerExists(id: string): Promise<{ success: boolean; exists?: boolean; error?: string }> {
    try {
      const result = await cookieBasedClient.models.Player.get(
        { id },
        { authMode: 'userPool' }
      );

      return {
        success: true,
        exists: !!result.data,
      };
    } catch (error) {
      console.error('Error checking if player exists:', error);
      return { success: false, error: 'Failed to check if player exists' };
    }
  }
}
