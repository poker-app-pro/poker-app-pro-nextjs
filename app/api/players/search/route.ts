import { NextRequest, NextResponse } from "next/server"
import { cookieBasedClient } from "@/lib/amplify-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("q")

    // Validate search term
    if (!searchTerm || searchTerm.length < 2) {
      return NextResponse.json({
        success: true,
        players: [],
      })
    }

    // Get all active players first, then filter client-side for case-insensitive search
    // This is because AWS AppSync doesn't support case-insensitive contains filters
    const playersResponse = await cookieBasedClient.models.Player.list({
      authMode: "userPool",
      filter: {
        isActive: { eq: true }
      },
    })

    if (!playersResponse.data) {
      return NextResponse.json({
        success: false,
        error: "Failed to search players",
      })
    }

    // Filter players by search term (case-insensitive)
    const filteredPlayers = playersResponse.data.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Format the response
    const players = filteredPlayers.map((player) => ({
      id: player.id,
      name: player.name,
    }))

    // Sort by name for consistent ordering
    players.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({
      success: true,
      players,
    })
  } catch (error) {
    console.error("Error searching players:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    )
  }
}
