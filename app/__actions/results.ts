"use server";

import { revalidatePath } from "next/cache";
import {
  cookieBasedClient,
  runWithAmplifyServerContext,
} from "@/lib/amplify-utils";
import { getCurrentUser } from "aws-amplify/auth/server";
import { cookies } from "next/headers";
 
function calculatePoints(position: number, totalPlayers: number): number {
  // Only award points to the top 10 players
  if (position > 10) {
    return 0;
  }

  // Weighted scoring algorithm: points = total players * (11-rank)
  return totalPlayers * (11 - position);
}
export async function saveGameResults(formData: FormData) {
  try {
    // Get current user
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    })
    const userId = currentUser.userId

    // Extract form data
    const seriesId = formData.get("seriesId") as string
    const totalPlayers = Number.parseInt(formData.get("totalPlayers") as string, 10)
    const gameTime = new Date(formData.get("gameTime") as string)

    // Parse player data
    const rankingsJson = formData.get("rankings") as string
    const bountiesJson = formData.get("bounties") as string
    const consolationJson = formData.get("consolation") as string

    const rankings = JSON.parse(rankingsJson) as any[]
    const bounties = JSON.parse(bountiesJson) as any[]
    const consolation = JSON.parse(consolationJson) as any[]

    // Validate total players is at least equal to the number of ranked players
    if (totalPlayers < rankings.length) {
      return {
        success: false,
        error: `Total players (${totalPlayers}) cannot be less than the number of ranked players (${rankings.length})`,
      }
    }

    // Get series details to get seasonId and leagueId
    const seriesResponse = await cookieBasedClient.models.Series.get(
      {
        id: seriesId,
      },
      {
        authMode: "userPool",
      },
    )
    if (!seriesResponse.data) {
      throw new Error("Series not found")
    }

    const series = seriesResponse.data
    const seasonId = series.seasonId
    const leagueId = series.leagueId

    // Generate tournament name based on series and date
    const tournamentName = `${series.name} - ${gameTime.toLocaleDateString()}`

    // 1. Create the tournament
    const tournamentResponse = await cookieBasedClient.models.Tournament.create(
      {
        name: tournamentName,
        seriesId,
        seasonId,
        leagueId,
        userId,
        // Store the full date and time from the form
        date: gameTime.toISOString(),
        status: "Completed",
        maxPlayers: totalPlayers, // Use the user-provided total players count
        totalPlayers: totalPlayers, // Explicitly store the total player count
        isFinalized: true,
        tournamentPlayers: [],
      },
      {
        authMode: "userPool",
      },
    )

    if (!tournamentResponse.data) {
      console.error("Failed to create tournament:", tournamentResponse.errors)
      throw new Error("Failed to create tournament")
    }

    const tournament = tournamentResponse.data
    const tournamentId = tournament.id

    // 2. Process ranked players
    for (const player of rankings) {
      // Check if player exists, create if not
      let playerId = player.id
      let playerData

      if (player.isNew) {
        // Create new player
        const newPlayerResponse = await cookieBasedClient.models.Player.create(
          {
            name: player.name,
            userId,
            isActive: true,
            joinDate: new Date().toISOString().split("T")[0],
            tournamentPlayers: [],
            scoreboards: [],
            qualifications: [],
          },
          {
            authMode: "userPool",
          },
        )

        if (!newPlayerResponse.data) {
          throw new Error(`Failed to create player: ${player.name}`)
        }

        playerData = newPlayerResponse.data
        playerId = playerData.id
      } else {
        // Get existing player
        const playerResponse = await cookieBasedClient.models.Player.get(
          {
            id: playerId,
          },
          {
            authMode: "userPool",
          },
        )
        if (!playerResponse.data) {
          throw new Error(`Player not found: ${playerId}`)
        }
        playerData = playerResponse.data
      }

      // Calculate points using the weighted algorithm
      const points = calculatePoints(player.position, totalPlayers)

      // Create tournament player record
      const tournamentPlayerResponse = await cookieBasedClient.models.TournamentPlayer.create(
        {
          tournamentId,
          playerId,
          registrationDate: new Date().toISOString().split("T")[0],
          checkedIn: true,
          checkedInAt: new Date().toISOString().split("T")[0],
          finalPosition: player.position,
          points: points,
        },
        {
          authMode: "userPool",
        },
      )

      if (!tournamentPlayerResponse.data) {
        throw new Error(`Failed to create tournament player record for: ${player.name}`)
      }

      const tournamentPlayerId = tournamentPlayerResponse.data.id

      // Update tournament with player
      await cookieBasedClient.models.Tournament.update(
        {
          id: tournamentId,
          tournamentPlayers: [...(tournament.tournamentPlayers || []), tournamentPlayerId],
        },
        {
          authMode: "userPool",
        },
      )

      // Update player with tournament player record
      await cookieBasedClient.models.Player.update(
        {
          id: playerId,
          tournamentPlayers: [...(playerData.tournamentPlayers || []), tournamentPlayerId],
        },
        {
          authMode: "userPool",
        },
      )

      // Update or create scoreboard entry
      const scoreboardResponse = await cookieBasedClient.models.Scoreboard.list({
        filter: {
          and: [{ seriesId: { eq: seriesId } }, { playerId: { eq: playerId } }],
        },
        authMode: "userPool",
      })

      if (scoreboardResponse.data.length > 0) {
        // Update existing scoreboard
        const scoreboard = scoreboardResponse.data[0]
        const newTotalPoints = (scoreboard.totalPoints || 0) + points
        const newTournamentCount = (scoreboard.tournamentCount || 0) + 1
        const newBestFinish = scoreboard.bestFinish ? Math.min(scoreboard.bestFinish, player.position) : player.position
        const newWinCount = (scoreboard.winCount || 0) + (player.position === 1 ? 1 : 0)
        const newTopThreeCount = (scoreboard.topThreeCount || 0) + (player.position <= 3 ? 1 : 0)

        // Calculate new average finish
        const oldTotal = (scoreboard.averageFinish || 0) * (scoreboard.tournamentCount || 0)
        const newAverage = Math.round((oldTotal + player.position) / newTournamentCount)

        await cookieBasedClient.models.Scoreboard.update(
          {
            id: scoreboard.id,
            totalPoints: newTotalPoints,
            tournamentCount: newTournamentCount,
            bestFinish: newBestFinish,
            averageFinish: newAverage,
            winCount: newWinCount,
            topThreeCount: newTopThreeCount,
            lastUpdated: new Date().toISOString().split("T")[0],
          },
          {
            authMode: "userPool",
          },
        )
      } else {
        // Create new scoreboard
        const newScoreboardResponse = await cookieBasedClient.models.Scoreboard.create(
          {
            seriesId,
            seasonId,
            leagueId,
            playerId,
            userId,
            totalPoints: points,
            tournamentCount: 1,
            bestFinish: player.position,
            averageFinish: player.position,
            winCount: player.position === 1 ? 1 : 0,
            topThreeCount: player.position <= 3 ? 1 : 0,
            lastUpdated: new Date().toISOString().split("T")[0],
          },
          {
            authMode: "userPool",
          },
        )

        if (!newScoreboardResponse.data) {
          throw new Error(`Failed to create scoreboard for player: ${player.name}`)
        }

        const scoreboardId = newScoreboardResponse.data.id

        // Update player with scoreboard
        await cookieBasedClient.models.Player.update(
          {
            id: playerId,
            scoreboards: [...(playerData.scoreboards || []), scoreboardId],
          },
          {
            authMode: "userPool",
          },
        )

        // Update series with scoreboard
        await cookieBasedClient.models.Series.update(
          {
            id: seriesId,
            scoreboards: [...(series.scoreboards || []), scoreboardId],
          },
          {
            authMode: "userPool",
          },
        )
      }

      // Handle qualification if player is in top positions
      if (player.position <= 3) {
        await cookieBasedClient.models.Qualification.create(
          {
            userId,
            seasonId,
            leagueId,
            playerId,
            tournamentId,
            qualificationType: player.position === 1 ? "Winner" : "TopThree",
            qualificationDate: new Date().toISOString().split("T")[0],
            isActive: true,
          },
          {
            authMode: "userPool",
          },
        )
      }
    }

    // 3. Process bounty players (just record them in notes for now)
    if (bounties.length > 0) {
      const bountyNames = bounties.map((p) => p.name).join(", ")
      await cookieBasedClient.models.Tournament.update(
        {
          id: tournamentId,
          notes: `Bounty players: ${bountyNames}`,
        },
        {
          authMode: "userPool",
        },
      )
    }

    // 4. Process consolation players (just record them in notes for now)
    if (consolation.length > 0) {
      const consolationNames = consolation.map((p) => p.name).join(", ")
      const currentNotes = tournament.notes || ""
      await cookieBasedClient.models.Tournament.update(
        {
          id: tournamentId,
          notes: currentNotes
            ? `${currentNotes}\nConsolation players: ${consolationNames}`
            : `Consolation players: ${consolationNames}`,
        },
        {
          authMode: "userPool",
        },
      )
    }

    // 5. Update relationships

    // Update series with tournament
    await cookieBasedClient.models.Series.update(
      {
        id: seriesId,
        tournaments: [...(series.tournaments || []), tournamentId],
      },
      {
        authMode: "userPool",
      },
    )

    // Update season with tournament
    const seasonResponse = await cookieBasedClient.models.Season.get(
      {
        id: seasonId,
      },
      {
        authMode: "userPool",
      },
    )
    if (seasonResponse.data) {
      const season = seasonResponse.data
      await cookieBasedClient.models.Season.update(
        {
          id: seasonId,
          tournaments: [...(season.tournaments || []), tournamentId],
        },
        {
          authMode: "userPool",
        },
      )
    }

    // Update league with tournament
    const leagueResponse = await cookieBasedClient.models.League.get(
      {
        id: leagueId,
      },
      {
        authMode: "userPool",
      },
    )
    if (leagueResponse.data) {
      const league = leagueResponse.data
      await cookieBasedClient.models.League.update(
        {
          id: leagueId,
          tournaments: [...(league.tournaments || []), tournamentId],
        },
        {
          authMode: "userPool",
        },
      )
    }

    // Revalidate relevant paths
    revalidatePath("/results")
    revalidatePath("/standings")
    revalidatePath("/players")
    revalidatePath("/qualification")

    return {
      success: true,
      data: tournament,
      message: "Tournament results saved successfully",
    }
  } catch (error) {
    console.error("Error saving game results:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save game results",
    }
  }
}


export async function getTournamentResults() {
  try {
    // Get current user for authorization
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    })

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Fetch tournaments
    const { data: tournaments } = await cookieBasedClient.models.Tournament.list({
      authMode: "userPool",
    })

    // Fetch tournament players for each tournament
    const tournamentResults = await Promise.all(
      tournaments
        .filter((tournament) => tournament.status === "Completed")
        .map(async (tournament) => {
          // Get tournament players
          const { data: tournamentPlayers } = await cookieBasedClient.models.TournamentPlayer.list({
            filter: { tournamentId: { eq: tournament.id } },
            authMode: "userPool",
          })

          // Get series info
          let seriesName = "Unknown Series"
          if (tournament.seriesId) {
            const { data: series } = await cookieBasedClient.models.Series.get(
              { id: tournament.seriesId },
              { authMode: "userPool" },
            )
            if (series) {
              seriesName = series.name
            }
          }

          // Sort players by position and find winner
          const sortedPlayers = tournamentPlayers
            .slice()
            .sort((a, b) => (a.finalPosition || 999) - (b.finalPosition || 999))

          let winner = "No results"
          if (sortedPlayers.length > 0 && sortedPlayers[0].playerId) {
            const { data: player } = await cookieBasedClient.models.Player.get(
              { id: sortedPlayers[0].playerId },
              { authMode: "userPool" },
            )
            if (player) {
              winner = player.name
            }
          }

          // Use the full date string for gameTime, not just the date part
          const gameTime = tournament.date || tournament.createdAt || new Date().toISOString()

          return {
            id: tournament.id,
            name: tournament.name,
            seriesName: seriesName,
            gameTime: gameTime, // Use the full date-time string
            location: tournament.location || "Unknown Location",
            totalPlayers: tournament.totalPlayers || tournamentPlayers.length,
            winner,
            createdAt: tournament.createdAt,
          }
        }),
    )

    // Sort by date (newest first)
    return tournamentResults.sort((a, b) => new Date(b.gameTime).getTime() - new Date(a.gameTime).getTime())
  } catch (error) {
    console.error("Error fetching tournament results:", error)
    throw error
  }
}

// Get details for a specific tournament
export async function getTournamentResultDetails(tournamentId: string) {
  try {
    // Get current user for authorization
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    })

    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Fetch tournament
    const { data: tournament } = await cookieBasedClient.models.Tournament.get(
      { id: tournamentId },
      { authMode: "userPool" },
    )

    if (!tournament) {
      throw new Error("Tournament not found")
    }

    // Get series, season, and league info
    let seriesName = "Unknown Series"
    let seasonName = "Unknown Season"
    let leagueName = "Unknown League"

    if (tournament.seriesId) {
      const { data: series } = await cookieBasedClient.models.Series.get(
        { id: tournament.seriesId },
        { authMode: "userPool" },
      )
      if (series) {
        seriesName = series.name
      }
    }

    if (tournament.seasonId) {
      const { data: season } = await cookieBasedClient.models.Season.get(
        { id: tournament.seasonId },
        { authMode: "userPool" },
      )
      if (season) {
        seasonName = season.name
      }
    }

    if (tournament.leagueId) {
      const { data: league } = await cookieBasedClient.models.League.get(
        { id: tournament.leagueId },
        { authMode: "userPool" },
      )
      if (league) {
        leagueName = league.name
      }
    }

    // Get tournament players
    const { data: tournamentPlayers } = await cookieBasedClient.models.TournamentPlayer.list({
      filter: { tournamentId: { eq: tournamentId } },
      authMode: "userPool",
    })

    // Get player details for each tournament player
    const playerResults = await Promise.all(
      tournamentPlayers.map(async (tp) => {
        let playerName = "Unknown Player"
        if (tp.playerId) {
          const { data: player } = await cookieBasedClient.models.Player.get(
            { id: tp.playerId },
            { authMode: "userPool" },
          )
          if (player) {
            playerName = player.name
          }
        }

        return {
          id: tp.id,
          playerId: tp.playerId,
          playerName: playerName,
          position: tp.finalPosition,
          points: tp.points || 0,
        }
      }),
    )

    // Sort players by position
    const sortedResults = playerResults.sort((a, b) => (a.position || 999) - (b.position || 999))

    // Calculate prize pool (if buyIn information is available)
    const buyIn = tournament.buyIn || 0
    const totalPlayers = tournament.totalPlayers || sortedResults.length
    const prizePool = buyIn * totalPlayers

    // Extract bounty and consolation information from notes if available
    const notes = tournament.notes || ""

    // Process bounty players
    const bountyPlayers: Record<string, number> = {}
    if (notes.includes("Bounty players:")) {
      const bountySection = notes.split("Bounty players:")[1].split("\n")[0].trim()
      const bountyNames = bountySection.split(", ")

      // Count occurrences of each player name for multiple bounties
      bountyNames.forEach((name) => {
        bountyPlayers[name] = (bountyPlayers[name] || 0) + 1
      })
    }

    // Process consolation players
    const consolationPlayers = notes.includes("Consolation players:")
      ? notes.split("Consolation players:")[1].split("\n")[0].trim().split(", ")
      : []

    // Add bounty and consolation flags to results
    const resultsWithFlags = sortedResults.map((result) => ({
      ...result,
      bountyCount: bountyPlayers[result.playerName] || 0,
      isConsolation: consolationPlayers.includes(result.playerName),
    }))

    return {
      id: tournament.id,
      name: tournament.name,
      seriesName: seriesName,
      seasonName: seasonName,
      leagueName: leagueName,
      gameTime: tournament.date ? new Date(tournament.date).toISOString() : new Date().toISOString(),
      location: tournament.location || "Unknown Location",
      buyIn: buyIn,
      prizePool,
      totalPlayers: totalPlayers, // Use the stored totalPlayers value
      results: resultsWithFlags,
    }
  } catch (error) {
    console.error("Error fetching tournament result details:", error)
    throw error
  }
}
