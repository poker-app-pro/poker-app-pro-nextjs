"use server";

import { cookieBasedClient } from "@/lib/amplify-utils";

export interface PlayerProfile {
  player: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    joinDate: string;
    isActive: boolean;
    profileImageUrl?: string;
    notes?: string;
    preferredGameTypes?: string[];
  };
  stats: {
    totalTournaments: number;
    totalWins: number;
    totalPoints: number;
    bestFinish: number;
    regularPoints: number;
    bountyPoints: number;
    consolationPoints: number;
  };
  tournamentResults: {
    id: string;
    tournamentId: string;
    tournamentName: string;
    seriesId: string;
    seriesName: string;
    seasonId: string;
    seasonName: string;
    date: string;
    finalPosition: number;
    points: number;
    bountyPoints: number;
    consolationPoints: number;
    totalPoints: number;
  }[];
  seriesScoreboards: {
    id: string;
    seriesId: string;
    seriesName: string;
    seasonId: string;
    seasonName: string;
    tournamentCount: number;
    bestFinish: number;
    totalPoints: number;
    regularPoints: number;
    bountyPoints: number;
    consolationPoints: number;
  }[];
  qualifications: {
    id: string;
    seasonEventName: string;
    chipCount: number;
    qualified: boolean;
    finalPosition: number | null;
  }[];
}

export async function getPlayerProfile(
  playerId: string
): Promise<{ success: boolean; data?: PlayerProfile; error?: string }> {
  try {
    // Get player details
    const playerResult = await cookieBasedClient.models.Player.get(
      { id: playerId },
      {
        authMode: "userPool",
      }
    );

    if (!playerResult.data) {
      return { success: false, error: "Player not found" };
    }

    const player = playerResult.data;

    // Get tournament players for this player
    const tournamentPlayersResult =
      await cookieBasedClient.models.TournamentPlayer.list({
        authMode: "userPool",
      });
    const playerTournaments = tournamentPlayersResult.data.filter(
      (tp) => tp.playerId === playerId
    );

    // Get all tournaments
    const tournamentsResult = await cookieBasedClient.models.Tournament.list({
      authMode: "userPool",
    });
    const tournaments = tournamentsResult.data;

    // Get all series
    const seriesResult = await cookieBasedClient.models.Series.list({
      authMode: "userPool",
    });
    const allSeries = seriesResult.data;

    // Get all seasons
    const seasonsResult = await cookieBasedClient.models.Season.list({
      authMode: "userPool",
    });
    const allSeasons = seasonsResult.data;

    // Get scoreboards for this player
    const scoreboardsResult = await cookieBasedClient.models.Scoreboard.list({
      authMode: "userPool",
    });
    const playerScoreboards = scoreboardsResult.data.filter(
      (sb) => sb.playerId === playerId
    );

    // Get qualifications for this player
    const qualificationsResult =
      await cookieBasedClient.models.Qualification.list({
        authMode: "userPool",
      });
    const playerQualifications = qualificationsResult.data.filter(
      (q) => q.playerId === playerId
    );

    // Calculate stats
    const totalTournaments = playerTournaments.length;
    const totalWins = playerTournaments.filter(
      (tp) => tp.finalPosition === 1
    ).length;

    // Calculate best finish
    const positions = playerTournaments
      .filter(
        (tp) => tp.finalPosition !== undefined && tp.finalPosition !== null
      )
      .map((tp) => tp.finalPosition);
    const bestFinish =
      positions.length > 0 ? Math.min(...(positions as number[])) : 0;

    // Calculate total points
    const totalPoints = playerScoreboards.reduce(
      (sum, sb) => sum + (sb.totalPoints || 0),
      0
    );

    // Calculate point breakdowns
    let regularPoints = 0;
    let bountyPoints = 0;
    let consolationPoints = 0;

    // Process tournament results
    const tournamentResults = await Promise.all(
      playerTournaments.map(async (tp) => {
        const tournament = tournaments.find((t) => t.id === tp.tournamentId);
        if (!tournament) return null;

        const series = allSeries.find((s) => s.id === tournament.seriesId);
        const season = allSeasons.find((s) => s.id === tournament.seasonId);

        // Calculate point breakdowns for this tournament
        const tpRegularPoints =
          (tp.points || 0) -
          (tp.bountyPoints || 0) -
          (tp.consolationPoints || 0);
        const tpBountyPoints = tp.bountyPoints || 0;
        const tpConsolationPoints = tp.consolationPoints || 0;

        // Add to total point breakdowns
        regularPoints += tpRegularPoints;
        bountyPoints += tpBountyPoints;
        consolationPoints += tpConsolationPoints;

        return {
          id: tp.id,
          tournamentId: tp.tournamentId,
          tournamentName: tournament.name,
          seriesId: tournament.seriesId,
          seriesName: series?.name || "Unknown Series",
          seasonId: tournament.seasonId,
          seasonName: season?.name || "Unknown Season",
          date: tournament.date,
          finalPosition: tp.finalPosition || 0,
          points: tpRegularPoints,
          bountyPoints: tpBountyPoints,
          consolationPoints: tpConsolationPoints,
          totalPoints: tp.points || 0,
        };
      })
    );

    // Filter out null values and sort by date (most recent first)
    const validTournamentResults = tournamentResults.filter(
      (result) => result !== null
    ) as NonNullable<(typeof tournamentResults)[0]>[];

    // Process series scoreboards
    const seriesScoreboards = await Promise.all(
      playerScoreboards.map(async (sb) => {
        const series = allSeries.find((s) => s.id === sb.seriesId);
        const season = allSeasons.find((s) => s.id === sb.seasonId);

        // Calculate point breakdowns for this scoreboard
        const seriesTournaments = playerTournaments.filter((tp) => {
          const tournament = tournaments.find((t) => t.id === tp.tournamentId);
          return tournament && tournament.seriesId === sb.seriesId;
        });

        const sbRegularPoints = seriesTournaments.reduce(
          (sum, tp) =>
            sum +
            ((tp.points || 0) -
              (tp.bountyPoints || 0) -
              (tp.consolationPoints || 0)),
          0
        );
        const sbBountyPoints = seriesTournaments.reduce(
          (sum, tp) => sum + (tp.bountyPoints || 0),
          0
        );
        const sbConsolationPoints = seriesTournaments.reduce(
          (sum, tp) => sum + (tp.consolationPoints || 0),
          0
        );

        return {
          id: sb.id,
          seriesId: sb.seriesId,
          seriesName: series?.name || "Unknown Series",
          seasonId: sb.seasonId,
          seasonName: season?.name || "Unknown Season",
          tournamentCount: sb.tournamentCount || 0,
          bestFinish: sb.bestFinish || 0,
          totalPoints: sb.totalPoints || 0,
          regularPoints: sbRegularPoints,
          bountyPoints: sbBountyPoints,
          consolationPoints: sbConsolationPoints,
        };
      })
    );

    // Sort series scoreboards by total points (descending)
    const sortedSeriesScoreboards = seriesScoreboards.sort(
      (a, b) => b.totalPoints - a.totalPoints
    );

    // Process qualifications
    const qualifications = await Promise.all(
      playerQualifications.map(async (q) => {
        const season = allSeasons.find((s) => s.id === q.seasonId);

        // Find tournament player entry for this qualification's tournament
        const tournamentPlayer = playerTournaments.find(
          (tp) => tp.tournamentId === q.tournamentId
        );

        return {
          id: q.id,
          seasonEventName: `${season?.name || "Unknown Season"} ${q.qualificationType || "Finale"}`,
          chipCount: 0, // This field might not be in the schema, using default
          qualified: q.isActive || false,
          finalPosition: tournamentPlayer?.finalPosition || null,
        };
      })
    );

    return {
      success: true,
      data: {
        player: {
          id: player.id,
          name: player.name,
          email: player.email as string,
          phone: player.phone as string,
          joinDate: player.joinDate || new Date().toISOString(),
          isActive: player.isActive || false,
          profileImageUrl: player.profileImageUrl as string,
          notes: player.notes as string,
          preferredGameTypes: player.preferredGameTypes as string[],
        },
        stats: {
          totalTournaments,
          totalWins,
          totalPoints,
          bestFinish,
          regularPoints,
          bountyPoints,
          consolationPoints,
        },
        tournamentResults: validTournamentResults,
        seriesScoreboards: sortedSeriesScoreboards,
        qualifications,
      },
    };
  } catch (error) {
    console.error("Error fetching player profile:", error);
    return { success: false, error: "Failed to fetch player profile" };
  }
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
  try {
    // Fetch all players
    const result = await cookieBasedClient.models.Player.list({
      authMode: "userPool",
    });

    if (!result.data) {
      return { success: false, error: "Failed to fetch players" };
    }

    // Get all tournament players to calculate tournament count and best finish
    const tournamentPlayersResult =
      await cookieBasedClient.models.TournamentPlayer.list({
        authMode: "userPool",
      });
    const tournamentPlayers = tournamentPlayersResult.data || [];

    // Get all scoreboards to get total points
    const scoreboardsResult = await cookieBasedClient.models.Scoreboard.list({
      authMode: "userPool",
    });
    const scoreboards = scoreboardsResult.data || [];

    // Process players to include additional data
    let players = result.data.map((player) => {
      // Find tournament players for this player
      const playerTournaments = tournamentPlayers.filter(
        (tp) => tp.playerId === player.id
      );

      // Calculate best finish
      const positions = playerTournaments
        .filter(
          (tp) => tp.finalPosition !== undefined && tp.finalPosition !== null
        )
        .map((tp) => tp.finalPosition);
      const bestFinish =
        positions.length > 0 ? Math.min(...(positions as number[])) : 0;

      // Calculate total points from scoreboards
      const playerScoreboards = scoreboards.filter(
        (sb) => sb.playerId === player.id
      );
      const totalPoints = playerScoreboards.reduce(
        (sum, sb) => sum + (sb.totalPoints || 0),
        0
      );

      return {
        id: player.id,
        name: player.name,
        joinedDate: player.joinDate || new Date().toISOString(),
        tournamentCount: playerTournaments.length,
        bestFinish,
        totalPoints,
        isActive: player.isActive || false,
      } as PlayerListItem;
    });

    // Apply search filter if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      players = players.filter((player) =>
        player.name.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const totalItems = players.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedPlayers = players.slice(startIndex, startIndex + pageSize);

    return {
      success: true,
      data: {
        players: paginatedPlayers,
        totalPages,
        currentPage,
        totalItems,
      },
    };
  } catch (error) {
    console.error("Error fetching players:", error);
    return { success: false, error: "Failed to fetch players" };
  }
}

export async function getPlayerById(id: string) {
  try {
    const result = await cookieBasedClient.models.Player.get(
      { id },
      { authMode: "userPool" }
    );

    if (!result.data) {
      return { success: false, error: "Player not found" };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error fetching player:", error);
    return { success: false, error: "Failed to fetch player" };
  }
}
