"use server";

import { cookieBasedClient } from "@/lib/amplify-utils";

export interface StandingsData {
  seasons: {
    id: string;
    name: string;
    league: {
      id: string;
      name: string;
    };
    series: {
      id: string;
      name: string;
      standings: {
        id: string;
        playerId: string;
        playerName: string;
        totalPoints: number;
        regularPoints: number;
        bountyPoints: number;
        consolationPoints: number;
        tournamentCount: number;
        bestFinish: number;
      }[];
    }[];
  }[];
}

export async function getStandings(): Promise<{
  success: boolean;
  data?: StandingsData;
  error?: string;
}> {
  try {
    // Get all active seasons
    const seasonsResult = await cookieBasedClient.models.Season.list({
      authMode: "userPool",
    });
    const seasons = seasonsResult.data.filter((season) => season.isActive);

    // For each season, get all series and their scoreboards
    const seasonsWithData = await Promise.all(
      seasons.map(async (season) => {
        // Get league info
        const leagueResult = await cookieBasedClient.models.League.get(
          {
            id: season.leagueId,
          },
          {
            authMode: "userPool",
          }
        );
        const league = leagueResult.data;

        // Get all series for this season
        const seriesResponse = await cookieBasedClient.models.Series.list({
          authMode: "userPool",
        });
        const seriesForSeason = seriesResponse.data.filter(
          (series) => series.seasonId === season.id
        );

        // For each series, get the scoreboard entries
        const seriesWithScoreboards = await Promise.all(
          seriesForSeason.map(async (series) => {
            const scoreboardResponse =
              await cookieBasedClient.models.Scoreboard.list({
                authMode: "userPool",
              });
            const scoreboardsForSeries = scoreboardResponse.data.filter(
              (scoreboard) => scoreboard.seriesId === series.id
            );

            // Get player details for each scoreboard entry
            const scoreboardsWithPlayers = await Promise.all(
              scoreboardsForSeries.map(async (scoreboard) => {
                const playerResult = await cookieBasedClient.models.Player.get(
                  {
                    id: scoreboard.playerId,
                  },
                  {
                    authMode: "userPool",
                  }
                );
                const player = playerResult.data;

                // Get tournament players to calculate points breakdown
                const tournamentPlayersResult =
                  await cookieBasedClient.models.TournamentPlayer.list({
                    authMode: "userPool",
                  });
                const playerTournaments = tournamentPlayersResult.data.filter(
                  (tp) => tp.playerId === scoreboard.playerId
                );

                // Calculate points breakdown (these fields might not exist in the schema yet)
                const regularPoints = playerTournaments.reduce(
                  (sum, tp) =>
                    sum +
                    (tp.points || 0) -
                    (tp.bountyPoints || 0) -
                    (tp.consolationPoints || 0),
                  0
                );
                const bountyPoints = playerTournaments.reduce(
                  (sum, tp) => sum + (tp.bountyPoints || 0),
                  0
                );
                const consolationPoints = playerTournaments.reduce(
                  (sum, tp) => sum + (tp.consolationPoints || 0),
                  0
                );

                return {
                  id: scoreboard.id,
                  playerId: scoreboard.playerId,
                  playerName: player?.name || "Unknown Player",
                  totalPoints: scoreboard.totalPoints || 0,
                  regularPoints: regularPoints,
                  bountyPoints: bountyPoints,
                  consolationPoints: consolationPoints,
                  tournamentCount: scoreboard.tournamentCount || 0,
                  bestFinish: scoreboard.bestFinish || 0,
                };
              })
            );

            // Sort scoreboards by total points (descending)
            const sortedScoreboards = scoreboardsWithPlayers.sort(
              (a, b) => b.totalPoints - a.totalPoints
            );

            return {
              id: series.id,
              name: series.name,
              standings: sortedScoreboards,
            };
          })
        );

        return {
          id: season.id,
          name: season.name,
          league: {
            id: league?.id || "",
            name: league?.name || "Unknown League",
          },
          series: seriesWithScoreboards,
        };
      })
    );

    return { success: true, data: { seasons: seasonsWithData } };
  } catch (error) {
    console.error("Error fetching standings:", error);
    return { success: false, error: "Failed to fetch standings" };
  }
}

export async function getSeriesStandings(seriesId: string) {
  try {
    // Get series details
    const seriesResult = await cookieBasedClient.models.Series.get(
      { id: seriesId },
      {
        authMode: "userPool",
      }
    );
    if (!seriesResult.data) {
      return { success: false, error: "Series not found" };
    }
    const series = seriesResult.data;

    // Get season details
    const seasonResult = await cookieBasedClient.models.Season.get(
      { id: series.seasonId },
      {
        authMode: "userPool",
      }
    );
    const season = seasonResult.data;

    // Get league details
    const leagueResult = season
      ? await cookieBasedClient.models.League.get(
          { id: season.leagueId },
          {
            authMode: "userPool",
          }
        )
      : null;
    const league = leagueResult?.data;

    // Get all scoreboard entries for this series
    const scoreboardResponse = await cookieBasedClient.models.Scoreboard.list({
      authMode: "userPool",
    });
    const scoreboardsForSeries = scoreboardResponse.data.filter(
      (scoreboard) => scoreboard.seriesId === seriesId
    );

    // Get player details and tournament results for each scoreboard entry
    const detailedScoreboards = await Promise.all(
      scoreboardsForSeries.map(async (scoreboard) => {
        const playerResult = await cookieBasedClient.models.Player.get(
          {
            id: scoreboard.playerId,
          },
          {
            authMode: "userPool",
          }
        );
        const player = playerResult.data;

        // Get tournament results for this player in this series
        const tournamentPlayersResult =
          await cookieBasedClient.models.TournamentPlayer.list({
            authMode: "userPool",
          });
        const tournamentPlayers = tournamentPlayersResult.data.filter(
          (tp) => tp.playerId === scoreboard.playerId
        );

        // Get all tournaments for this series
        const tournamentsResult =
          await cookieBasedClient.models.Tournament.list({
            authMode: "userPool",
          });
        const seriesTournaments = tournamentsResult.data.filter(
          (t) => t.seriesId === seriesId
        );

        // Match tournament players with tournaments
        const tournamentResults = await Promise.all(
          tournamentPlayers
            .filter((tp) => {
              // Only include tournament players that belong to tournaments in this series
              const tournament = seriesTournaments.find(
                (t) => t.id === tp.tournamentId
              );
              return !!tournament;
            })
            .map(async (tp) => {
              const tournament = seriesTournaments.find(
                (t) => t.id === tp.tournamentId
              );

              return {
                id: tp.id,
                tournamentId: tp.tournamentId,
                tournamentName: tournament?.name || "Unknown Tournament",
                date: tournament?.date || new Date().toISOString(),
                finalPosition: tp.finalPosition || 0,
                points: tp.points || 0,
                bountyPoints: tp.bountyPoints || 0,
                consolationPoints: tp.consolationPoints || 0,
              };
            })
        );

        // Sort tournament results by date (most recent first)
        const sortedResults = tournamentResults.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Calculate points breakdown
        const regularPoints = tournamentResults.reduce(
          (sum, tr) =>
            sum + (tr.points - tr.bountyPoints - tr.consolationPoints),
          0
        );
        const bountyPoints = tournamentResults.reduce(
          (sum, tr) => sum + tr.bountyPoints,
          0
        );
        const consolationPoints = tournamentResults.reduce(
          (sum, tr) => sum + tr.consolationPoints,
          0
        );

        return {
          id: scoreboard.id,
          playerId: scoreboard.playerId,
          playerName: player?.name || "Unknown Player",
          totalPoints: scoreboard.totalPoints || 0,
          regularPoints: regularPoints,
          bountyPoints: bountyPoints,
          consolationPoints: consolationPoints,
          tournamentCount: scoreboard.tournamentCount || 0,
          bestFinish: scoreboard.bestFinish || 0,
          tournamentResults: sortedResults,
        };
      })
    );

    // Sort scoreboards by total points (descending)
    const sortedScoreboards = detailedScoreboards.sort(
      (a, b) => b.totalPoints - a.totalPoints
    );

    return {
      success: true,
      data: {
        series,
        season,
        league,
        standings: sortedScoreboards,
      },
    };
  } catch (error) {
    console.error("Error fetching series standings:", error);
    return { success: false, error: "Failed to fetch series standings" };
  }
}
