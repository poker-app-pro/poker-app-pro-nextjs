"use server";

import { cookieBasedClient } from "@/lib/amplify-utils";
import { revalidatePath } from "next/cache";

// Types for our data
export interface QualifiedPlayer {
  id: string;
  name: string;
  tournamentCount: number;
  totalChips: number;
  qualificationType?: string;
}

export interface QualificationStatus {
  totalQualified: number;
  maxPlayers: number;
  tournamentWinners: number;
  topQualifiers: number;
  remainingSpots: number;
}

export interface SeasonEvent {
  id: string;
  name: string;
  date: string;
  playerCount: number;
  results: SeasonEventResult[];
}

export interface SeasonEventResult {
  position: number;
  playerId: string;
  playerName: string;
  startingChips: number;
  prize: number;
}

// Get all active seasons
export async function getActiveSeasons() {
  try {
    const result = await cookieBasedClient.models.Season.list({
      filter: { isActive: { eq: true } },
      authMode: "userPool",
    });

    return {
      success: true,
      data: result.data.map((season) => ({
        id: season.id,
        name: season.name,
      })),
    };
  } catch (error) {
    console.error("Error fetching active seasons:", error);
    return { success: false, error: "Failed to fetch active seasons" };
  }
}

// Get qualified players for a season
export async function getQualifiedPlayers(
  seasonId: string,
  searchQuery?: string
) {
  try {
    // Get all qualifications for this season
    const qualifications = await cookieBasedClient.models.Qualification.list({
      filter: {
        and: [{ seasonId: { eq: seasonId } }, { isActive: { eq: true } }],
      },
      authMode: "userPool",
    });

    // Get all tournament players for this season to count participation
    const tournaments = await cookieBasedClient.models.Tournament.list({
      filter: { seasonId: { eq: seasonId } },
      authMode: "userPool",
    });

    const tournamentIds = tournaments.data.map((t) => t.id);

    // Get all tournament players for these tournaments
    const allTournamentPlayers =
      await cookieBasedClient.models.TournamentPlayer.list({
        authMode: "userPool",
      });

    // Step 2: Filter in-memory by tournamentIds
    const tournamentPlayers = allTournamentPlayers.data?.filter((tp) =>
      tournamentIds.includes(tp.tournamentId)
    );

    // Group tournament players by player ID to count participation
    const playerParticipation = tournamentPlayers.reduce(
      (acc, tp) => {
        if (!acc[tp.playerId]) {
          acc[tp.playerId] = 0;
        }
        acc[tp.playerId]++;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get all scoreboards for this season to calculate total points
    const scoreboards = await cookieBasedClient.models.Scoreboard.list({
      filter: { seasonId: { eq: seasonId } },
      authMode: "userPool",
    });

    // Group scoreboards by player ID to sum total points
    const playerPoints = scoreboards.data.reduce(
      (acc, sb) => {
        if (!acc[sb.playerId]) {
          acc[sb.playerId] = 0;
        }
        acc[sb.playerId] += Number(sb?.totalPoints);
        return acc;
      },
      {} as Record<string, number>
    );

    // Process qualifications to get qualified players
    const qualifiedPlayersMap = new Map<string, QualifiedPlayer>();

    for (const qualification of qualifications.data) {
      // Get player details
      const player = await cookieBasedClient.models.Player.get(
        { id: qualification.playerId },
        { authMode: "userPool" }
      );

      if (!player.data) continue;

      // Calculate chip count based on qualification type and points
      // Base: 10,000 chips
      // Tournament winners: +15,000 chips
      // Top 3 finishers: +5,000 chips
      // Points: 100 chips per point
      let totalChips = 10000;

      if (qualification.qualificationType === "Winner") {
        totalChips += 15000;
      } else if (qualification.qualificationType === "TopThree") {
        totalChips += 5000;
      }

      // Add chips based on points
      const points = playerPoints[qualification.playerId] || 0;
      totalChips += points * 100;

      // If player is already in the map, update only if new chip count is higher
      if (qualifiedPlayersMap.has(qualification.playerId)) {
        const existingPlayer = qualifiedPlayersMap.get(qualification.playerId)!;
        if (totalChips > existingPlayer.totalChips) {
          existingPlayer.totalChips = totalChips;
          existingPlayer.qualificationType =
            qualification.qualificationType as string;
        }
      } else {
        qualifiedPlayersMap.set(qualification.playerId, {
          id: qualification.playerId,
          name: player.data.name,
          tournamentCount: playerParticipation[qualification.playerId] || 0,
          totalChips,
          qualificationType: qualification.qualificationType as string,
        });
      }
    }

    // Convert map to array and sort by chip count (descending)
    let qualifiedPlayers = Array.from(qualifiedPlayersMap.values()).sort(
      (a, b) => b.totalChips - a.totalChips
    );

    // Apply search filter if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      qualifiedPlayers = qualifiedPlayers.filter((player) =>
        player.name.toLowerCase().includes(query)
      );
    }

    return { success: true, data: qualifiedPlayers };
  } catch (error) {
    console.error("Error fetching qualified players:", error);
    return { success: false, error: "Failed to fetch qualified players" };
  }
}

// Get qualification status for a season
export async function getQualificationStatus(seasonId: string) {
  try {
    // Get all qualifications for this season
    const qualifications = await cookieBasedClient.models.Qualification.list({
      filter: {
        and: [{ seasonId: { eq: seasonId } }, { isActive: { eq: true } }],
      },
      authMode: "userPool",
    });

    // Count unique players
    const uniquePlayers = new Set(qualifications.data.map((q) => q.playerId));
    const totalQualified = uniquePlayers.size;

    // Count qualification types
    const tournamentWinners = qualifications.data.filter(
      (q) => q.qualificationType === "Winner"
    ).length;
    const topQualifiers = qualifications.data.filter(
      (q) => q.qualificationType === "TopThree"
    ).length;

    // Assume 32 player cap for now (this could be configurable in the future)
    const maxPlayers = 32;
    const remainingSpots = Math.max(0, maxPlayers - totalQualified);

    return {
      success: true,
      data: {
        totalQualified,
        maxPlayers,
        tournamentWinners,
        topQualifiers,
        remainingSpots,
      },
    };
  } catch (error) {
    console.error("Error fetching qualification status:", error);
    return { success: false, error: "Failed to fetch qualification status" };
  }
}

// Get previous season events
export async function getPreviousSeasonEvents(seasonId: string) {
  try {
    // Get all tournaments that are marked as season events
    const tournaments = await cookieBasedClient.models.Tournament.list({
      filter: {
        and: [{ status: { eq: "Completed" } }, { isFinalized: { eq: true } }],
      },
      authMode: "userPool",
    });

    // Filter to only include season events (not the current season)
    const seasonEvents = await Promise.all(
      tournaments.data
        .filter((t) => t.seasonId !== seasonId && t.seriesId === "season-event")
        .slice(0, 3) // Limit to 3 most recent events
        .map(async (tournament) => {
          // Get season details
          const season = await cookieBasedClient.models.Season.get(
            { id: tournament.seasonId },
            { authMode: "userPool" }
          );

          // Get tournament players
          const tournamentPlayers =
            await cookieBasedClient.models.TournamentPlayer.list({
              filter: { tournamentId: { eq: tournament.id } },
              authMode: "userPool",
            });

          // Get player details and map to results
          const results = await Promise.all(
            tournamentPlayers.data.slice(0, 5).map(async (tp) => {
              const player = await cookieBasedClient.models.Player.get(
                { id: tp.playerId },
                { authMode: "userPool" }
              );
              return {
                position: tp.finalPosition || 0,
                playerId: tp.playerId,
                playerName: player.data?.name || "Unknown Player",
                startingChips: 10000 + (tp.points || 0) * 100, // Simplified calculation
                prize: tp.payout || 0,
              };
            })
          );

          return {
            id: tournament.id,
            name: `${season.data?.name || "Unknown Season"} - Season Event`,
            date: tournament.date,
            playerCount: tournamentPlayers.data.length,
            results,
          };
        })
    );

    return { success: true, data: seasonEvents };
  } catch (error) {
    console.error("Error fetching previous season events:", error);
    return { success: false, error: "Failed to fetch previous season events" };
  }
}

// Record season event results
export async function recordSeasonEventResults(formData: FormData) {
  try {
    const seasonId = formData.get("seasonId") as string;
    const eventName = formData.get("eventName") as string;
    const eventDate = new Date(formData.get("eventDate") as string);
    const resultsJson = formData.get("results") as string;
    const results = JSON.parse(resultsJson);
    const userId = formData.get("userId") as string;

    // Get season details to get leagueId
    const season = await cookieBasedClient.models.Season.get(
      { id: seasonId },
      { authMode: "userPool" }
    );
    if (!season.data) {
      return { success: false, error: "Season not found" };
    }

    const leagueId = season.data.leagueId;

    // Create tournament for the season event
    const tournament = await cookieBasedClient.models.Tournament.create(
      {
        name: eventName,
        seriesId: "season-event", // Special marker for season events
        seasonId,
        leagueId,
        userId,
        date: eventDate.toISOString(),
        status: "Completed",
        isFinalized: true,
        maxPlayers: results.length,
        tournamentPlayers: [],
      },
      {
        authMode: "userPool",
      }
    );

    // Process each player result
    for (const result of results) {
      // Create tournament player record
      const tournamentPlayer =
        await cookieBasedClient.models.TournamentPlayer.create(
          {
            tournamentId: tournament.data?.id as string,
            playerId: result.playerId,
            finalPosition: result.position,
            points: 0, // No points for season event
            payout: result.prize,
            checkedIn: true,
            checkedInAt: eventDate.toISOString(),
          },
          {
            authMode: "userPool",
          }
        );

      // Update tournament with player
      await cookieBasedClient.models.Tournament.update(
        {
          id: tournament.data?.id as string,
          tournamentPlayers: [
            ...(tournament.data?.tournamentPlayers || []),
            tournamentPlayer.data?.id as string,
          ],
        },
        {
          authMode: "userPool",
        }
      );

      // Update player record
      const player = await cookieBasedClient.models.Player.get(
        { id: result.playerId },
        { authMode: "userPool" }
      );
      if (player.data) {
        await cookieBasedClient.models.Player.update(
          {
            id: result.playerId,
            tournamentPlayers: [
              ...(player.data.tournamentPlayers || []),
              tournamentPlayer.data?.id as string,
            ],
          },
          {
            authMode: "userPool",
          }
        );
      }
    }

    // Update season with tournament
    await cookieBasedClient.models.Season.update(
      {
        id: seasonId,
        tournaments: [
          ...(season.data.tournaments || []),
          tournament.data?.id as string,
        ],
      },
      {
        authMode: "userPool",
      }
    );

    // Log activity
    await cookieBasedClient.models.ActivityLog.create(
      {
        userId,
        action: "RECORD_SEASON_EVENT",
        entityType: "Tournament",
        entityId: tournament.data?.id as string,
        details: { seasonId, results: results.length },
        timestamp: new Date().toISOString(),
      },
      {
        authMode: "userPool",
      }
    );

    revalidatePath("/qualification");
    return { success: true, data: tournament.data };
  } catch (error) {
    console.error("Error recording season event results:", error);
    return { success: false, error: "Failed to record season event results" };
  }
}
