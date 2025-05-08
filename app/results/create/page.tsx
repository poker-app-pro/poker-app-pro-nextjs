"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Trophy, Loader2, AlertCircle, X, Users, Calendar } from "lucide-react"
import { PlayerAutoSuggest } from "@/components/ui/player-auto-suggest" 
import { DraggablePlayerList } from "@/components/dashboard/draggable-player-list"

type FormState = "idle" | "submitting" | "success" | "error"

interface Player {
  id: string
  name: string
  isNew?: boolean
}

interface Series {
  id: string
  name: string
  seasonName: string
  leagueName: string
  lastActivity: Date
}

// Mock data for existing players
const MOCK_PLAYERS: Player[] = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Emma Johnson" },
  { id: "3", name: "Michael Brown" },
  { id: "4", name: "Olivia Davis" },
  { id: "5", name: "William Wilson" },
  { id: "6", name: "Sophia Martinez" },
  { id: "7", name: "James Anderson" },
  { id: "8", name: "Charlotte Taylor" },
  { id: "9", name: "Benjamin Thomas" },
  { id: "10", name: "Amelia Harris" },
  { id: "11", name: "Lucas Clark" },
  { id: "12", name: "Mia Lewis" },
]

// Mock data for active series
const MOCK_SERIES: Series[] = [
  {
    id: "1",
    name: "Summer Series",
    seasonName: "Summer 2024",
    leagueName: "Texas Hold'em League",
    lastActivity: new Date(2024, 5, 15),
  },
  {
    id: "2",
    name: "Beginner Series",
    seasonName: "Summer 2024",
    leagueName: "Texas Hold'em League",
    lastActivity: new Date(2024, 5, 10),
  },
  {
    id: "3",
    name: "Advanced Series",
    seasonName: "Spring 2024",
    leagueName: "Omaha League",
    lastActivity: new Date(2024, 4, 20),
  },
  {
    id: "4",
    name: "Weekly Series",
    seasonName: "Spring 2024",
    leagueName: "Seven Card Stud League",
    lastActivity: new Date(2024, 4, 5),
  },
]

// Sort series by most recent activity
const SORTED_SERIES = [...MOCK_SERIES].sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())

// Group series by tournament (in this case, by season)
const GROUPED_SERIES = SORTED_SERIES.reduce(
  (groups, series) => {
    const key = series.seasonName
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(series)
    return groups
  },
  {} as Record<string, Series[]>,
)

export default function CreateTournamentPage() {
  const router = useRouter()

  const [state, setState] = useState<FormState>("idle")
  const [error, setError] = useState("")

  // Form fields
  const [seriesId, setSeriesId] = useState("")
  const [totalPlayers, setTotalPlayers] = useState<number>(0)
  const [gameTime, setGameTime] = useState<string>(() => {
    const now = new Date()
    return `${now.toISOString().split("T")[0]}T${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
  })

  // Player sections
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>(MOCK_PLAYERS)
  const [rankingPlayers, setRankingPlayers] = useState<Player[]>([])
  const [bountyPlayers, setBountyPlayers] = useState<Player[]>([])
  const [consolationPlayers, setConsolationPlayers] = useState<Player[]>([])

  // Validation errors
  const [seriesError, setSeriesError] = useState("")
  const [totalPlayersError, setTotalPlayersError] = useState("")
  const [gameTimeError, setGameTimeError] = useState("")

  // Handle adding a player to a specific section
  const handleAddPlayer = (player: Player, section: "rankings" | "bounties" | "consolation") => {
    // Check if player is already in any section
    const isInRankings = rankingPlayers.some((p) => p.id === player.id)
    const isInBounties = bountyPlayers.some((p) => p.id === player.id)
    const isInConsolation = consolationPlayers.some((p) => p.id === player.id)

    // If player is already in the target section, do nothing
    if (
      (section === "rankings" && isInRankings) ||
      (section === "bounties" && isInBounties) ||
      (section === "consolation" && isInConsolation)
    ) {
      return
    }

    // Remove player from available players for this section
    const updatedAvailable = [...availablePlayers]
    const playerIndex = updatedAvailable.findIndex((p) => p.id === player.id)

    if (playerIndex !== -1) {
      updatedAvailable.splice(playerIndex, 1)
      setAvailablePlayers(updatedAvailable)
    }

    // Add player to the appropriate section
    if (section === "rankings" && !isInRankings) {
      setRankingPlayers([...rankingPlayers, player])
    } else if (section === "bounties" && !isInBounties) {
      setBountyPlayers([...bountyPlayers, player])
    } else if (section === "consolation" && !isInConsolation) {
      setConsolationPlayers([...consolationPlayers, player])
    }
  }

  // Handle removing a player from a section
  const handleRemovePlayer = (player: Player, section: "rankings" | "bounties" | "consolation") => {
    // Check if player is in other sections
    const isInRankings = section !== "rankings" && rankingPlayers.some((p) => p.id === player.id)
    const isInBounties = section !== "bounties" && bountyPlayers.some((p) => p.id === player.id)
    const isInConsolation = section !== "consolation" && consolationPlayers.some((p) => p.id === player.id)

    // Only add back to available if not in any other section
    if (!isInRankings && !isInBounties && !isInConsolation) {
      setAvailablePlayers([...availablePlayers, player])
    }

    // Remove player from the appropriate section
    if (section === "rankings") {
      setRankingPlayers(rankingPlayers.filter((p) => p.id !== player.id))
    } else if (section === "bounties") {
      setBountyPlayers(bountyPlayers.filter((p) => p.id !== player.id))
    } else if (section === "consolation") {
      setConsolationPlayers(consolationPlayers.filter((p) => p.id !== player.id))
    }
  }

  const validateForm = (): boolean => {
    let isValid = true

    // Reset errors
    setSeriesError("")
    setTotalPlayersError("")
    setGameTimeError("")

    // Validate series
    if (!seriesId) {
      setSeriesError("Please select a series")
      isValid = false
    }

    // Validate total players
    if (totalPlayers <= 0) {
      setTotalPlayersError("Total players must be greater than 0")
      isValid = false
    }

    // Validate game time
    if (!gameTime) {
      setGameTimeError("Game time is required")
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setState("submitting")
    setError("")

    try {
      // This would be replaced with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create tournament object
      const tournament = {
        seriesId,
        totalPlayers,
        gameTime: new Date(gameTime).toISOString(),
        rankings: rankingPlayers.map((player, index) => ({
          ...player,
          position: index + 1,
          points: Math.max(100 - index * 10, 10),
        })),
        bounties: bountyPlayers,
        consolation: consolationPlayers,
      }

      console.log("Recording tournament results:", tournament)

      // For demo purposes, show success state
      setState("success")

      // After 1 second, redirect to tournaments page
      setTimeout(() => {
        router.push("/results")
      }, 1000)
    } catch (err) {
      console.log(err)
      setState("error")
      setError("An error occurred while recording the tournament results. Please try again.")
    }
  }

  const breadcrumbItems = [{ label: "Tournaments", href: "/results" }, { label: "Record Results" }]

  return (
    <AppLayout title="Record Tournament Results" breadcrumbs={<Breadcrumb items={breadcrumbItems} />}>
      <div className="max-w-3xl mx-auto">
        {state === "error" && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {state === "success" ? (
          <div className="material-card p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-4 flex items-center justify-center">
              <Trophy className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-medium mb-2">Results Recorded Successfully!</h2>
            <p className="text-muted-foreground mb-6">The tournament results have been saved.</p>
            <p className="text-sm text-muted-foreground">Redirecting to tournaments page...</p>
          </div>
        ) : (
          <div className="material-card">
            <div className="material-card-header">
              <h2 className="material-card-title flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Record Tournament Results
              </h2>
              <p className="material-card-subtitle">Record the results of a completed tournament</p>
            </div>

            <form onSubmit={handleSubmit} className="material-card-content space-y-6">
              <div>
                <label htmlFor="series" className="material-label">
                  Series*
                </label>
                <select
                  id="series"
                  value={seriesId}
                  onChange={(e) => setSeriesId(e.target.value)}
                  className={`material-input ${seriesError ? "border-destructive" : ""}`}
                  disabled={state === "submitting"}
                >
                  <option value="">Select a series</option>
                  {Object.entries(GROUPED_SERIES).map(([tournament, seriesList]) => (
                    <optgroup key={tournament} label={tournament}>
                      {seriesList.map((series) => (
                        <option key={series.id} value={series.id}>
                          {series.name} ({series.leagueName})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {seriesError && <p className="text-destructive text-xs mt-1">{seriesError}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="totalPlayers" className="material-label">
                    Total Players*
                  </label>
                  <input
                    id="totalPlayers"
                    type="number"
                    min="1"
                    value={totalPlayers || ""}
                    onChange={(e) => setTotalPlayers(Number.parseInt(e.target.value) || 0)}
                    className={`material-input ${totalPlayersError ? "border-destructive" : ""}`}
                    disabled={state === "submitting"}
                  />
                  {totalPlayersError && <p className="text-destructive text-xs mt-1">{totalPlayersError}</p>}
                </div>

                <div>
                  <label htmlFor="gameTime" className="material-label flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Game Time*
                  </label>
                  <input
                    id="gameTime"
                    type="datetime-local"
                    value={gameTime}
                    onChange={(e) => setGameTime(e.target.value)}
                    className={`material-input ${gameTimeError ? "border-destructive" : ""}`}
                    disabled={state === "submitting"}
                  />
                  {gameTimeError && <p className="text-destructive text-xs mt-1">{gameTimeError}</p>}
                </div>
              </div>

              {/* Player Rankings Section */}
              <div className="border border-gray-200 rounded-md p-4">
                <label className="material-label flex items-center gap-2 mb-4">
                  <Trophy className="h-4 w-4" />
                  Player Rankings
                </label>

                <div className="space-y-4">
                  <PlayerAutoSuggest
                    onSelect={(player) => handleAddPlayer(player, "rankings")}
                    existingPlayers={availablePlayers}
                    placeholder="Search players to add to rankings"
                  />

                  <DraggablePlayerList
                    players={rankingPlayers}
                    onPlayersChange={setRankingPlayers}
                    onRemovePlayer={(player) => handleRemovePlayer(player, "rankings")}
                  />
                </div>
              </div>

              {/* Player Bounties Section */}
              <div className="border border-gray-200 rounded-md p-4">
                <label className="material-label flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4" />
                  Player Bounties
                </label>

                <div className="space-y-4">
                  <PlayerAutoSuggest
                    onSelect={(player) => handleAddPlayer(player, "bounties")}
                    existingPlayers={availablePlayers}
                    placeholder="Search players to add to bounties"
                  />

                  <div className="space-y-2">
                    {bountyPlayers.length === 0 ? (
                      <div className="text-center py-4 border border-dashed border-gray-200 rounded-md">
                        <p className="text-muted-foreground">No bounty players added yet</p>
                      </div>
                    ) : (
                      bountyPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between bg-white border border-gray-200 rounded-md p-3"
                        >
                          <span>{player.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePlayer(player, "bounties")}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Consolation Games Section */}
              <div className="border border-gray-200 rounded-md p-4">
                <label className="material-label flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4" />
                  Consolation Games
                </label>

                <div className="space-y-4">
                  <PlayerAutoSuggest
                    onSelect={(player) => handleAddPlayer(player, "consolation")}
                    existingPlayers={availablePlayers}
                    placeholder="Search players to add to consolation games"
                  />

                  <div className="space-y-2">
                    {consolationPlayers.length === 0 ? (
                      <div className="text-center py-4 border border-dashed border-gray-200 rounded-md">
                        <p className="text-muted-foreground">No consolation players added yet</p>
                      </div>
                    ) : (
                      consolationPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between bg-white border border-gray-200 rounded-md p-3"
                        >
                          <span>{player.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePlayer(player, "consolation")}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/results")}
                  className="material-button-secondary"
                  disabled={state === "submitting"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="material-button-primary bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  disabled={state === "submitting"}
                >
                  {state === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Results...
                    </>
                  ) : (
                    "Save Results"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
