"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Trophy, Loader2, AlertCircle, X, Users, Calendar } from "lucide-react"
import { PlayerAutoSuggest } from "@/components/ui/player-auto-suggest"
import { client } from "@/components/AmplifyClient"
import { saveGameResults } from "@/app/__actions/results"
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
  seasonId: string
  leagueId: string
  seasonName: string
  leagueName: string
  lastActivity: Date
}

export default function CreateTournamentPage() {
  const router = useRouter()

  const [state, setState] = useState<FormState>("idle")
  const [error, setError] = useState("")
  const [series, setSeries] = useState<Series[]>([])
  const [, setPlayers] = useState<Player[]>([])

  // Form fields
  const [seriesId, setSeriesId] = useState("")
  const [totalPlayers, setTotalPlayers] = useState<number>(0)
  const [gameTime, setGameTime] = useState<string>(() => {
    const now = new Date()
    return `${now.toISOString().split("T")[0]}T${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
  })

  // Player sections
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  const [rankingPlayers, setRankingPlayers] = useState<Player[]>([])
  const [bountyPlayers, setBountyPlayers] = useState<Player[]>([])
  const [consolationPlayers, setConsolationPlayers] = useState<Player[]>([])

  // Validation errors
  const [seriesError, setSeriesError] = useState("")
  const [totalPlayersError, setTotalPlayersError] = useState("")
  const [gameTimeError, setGameTimeError] = useState("")

  // Update total players when ranking players change
  useEffect(() => {
    if (rankingPlayers.length > totalPlayers) {
      setTotalPlayers(rankingPlayers.length)
    }
  }, [rankingPlayers, totalPlayers])

  // Fetch series and players on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch active series
        const seriesResponse = await client.models.Series.list({
          authMode: "userPool",
          filter: { isActive: { eq: true } },
        })

        if (seriesResponse.data.length > 0) {
          // Get season and league details for each series
          const seriesWithDetails = await Promise.all(
            seriesResponse.data.map(async (series) => {
              const seasonResponse = await client.models.Season.get({ id: series.seasonId }, { authMode: "userPool" })
              const leagueResponse = await client.models.League.get({ id: series.leagueId }, { authMode: "userPool" })

              return {
                id: series.id,
                name: series.name,
                seasonId: series.seasonId,
                leagueId: series.leagueId,
                seasonName: seasonResponse.data?.name || "Unknown Season",
                leagueName: leagueResponse.data?.name || "Unknown League",
                lastActivity: new Date(series.startDate),
              }
            }),
          )

          // Sort by most recent activity
          const sortedSeries = seriesWithDetails.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())

          setSeries(sortedSeries)
        }

        // Fetch active players
        const playersResponse = await client.models.Player.list({
          authMode: "userPool",
          filter: { isActive: { eq: true } },
        })

        if (playersResponse.data.length > 0) {
          const playersList = playersResponse.data.map((player) => ({
            id: player.id,
            name: player.name,
          }))

          setPlayers(playersList)
          setAvailablePlayers(playersList)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load series and players data")
      }
    }

    fetchData()
  }, [])

  // Group series by season
  const GROUPED_SERIES = series.reduce(
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

    // For rankings section, remove player from available players
    if (section === "rankings" && !isInRankings) {
      // Remove player from available players
      const updatedAvailable = [...availablePlayers]
      const playerIndex = updatedAvailable.findIndex((p) => p.id === player.id)

      if (playerIndex !== -1) {
        updatedAvailable.splice(playerIndex, 1)
        setAvailablePlayers(updatedAvailable)
      }

      const newRankingPlayers = [...rankingPlayers, player]
      setRankingPlayers(newRankingPlayers)

      // Auto-update total players if needed
      if (newRankingPlayers.length > totalPlayers) {
        setTotalPlayers(newRankingPlayers.length)
      }
    }
    // For bounties section, only allow players from rankings
    else if (section === "bounties" && !isInBounties) {
      setBountyPlayers([...bountyPlayers, player])
    }
    // For consolation section, remove player from available players
    else if (section === "consolation" && !isInConsolation) {
      // Remove player from available players
      const updatedAvailable = [...availablePlayers]
      const playerIndex = updatedAvailable.findIndex((p) => p.id === player.id)

      if (playerIndex !== -1) {
        updatedAvailable.splice(playerIndex, 1)
        setAvailablePlayers(updatedAvailable)
      }

      setConsolationPlayers([...consolationPlayers, player])
    }
  }

  // Handle removing a player from a section
  const handleRemovePlayer = (player: Player, section: "rankings" | "bounties" | "consolation") => {
    // Check if player is in other sections
    const isInRankings = section !== "rankings" && rankingPlayers.some((p) => p.id === player.id)
    const isInBounties = section !== "bounties" && bountyPlayers.some((p) => p.id === player.id)
    const isInConsolation = section !== "consolation" && consolationPlayers.some((p) => p.id === player.id)

    // Only add back to available if not in any other section and not removing from bounties
    // (since bounties should only come from rankings)
    if (!isInRankings && !isInBounties && !isInConsolation && section !== "bounties") {
      setAvailablePlayers([...availablePlayers, player])
    }

    // Remove player from the appropriate section
    if (section === "rankings") {
      setRankingPlayers(rankingPlayers.filter((p) => p.id !== player.id))

      // Also remove from bounties if present, since bounties must be in rankings
      const isInBounties = bountyPlayers.some((p) => p.id === player.id)
      if (isInBounties) {
        setBountyPlayers(bountyPlayers.filter((p) => p.id !== player.id))
      }
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
    setError("")

    // Validate series
    if (!seriesId) {
      setSeriesError("Please select a series")
      isValid = false
    }

    // Validate total players
    if (totalPlayers <= 0) {
      setTotalPlayersError("Total players must be greater than 0")
      isValid = false
    } else if (totalPlayers < rankingPlayers.length) {
      setTotalPlayersError(`Total players must be at least ${rankingPlayers.length} (number of ranked players)`)
      isValid = false
    }

    // Validate game time
    if (!gameTime) {
      setGameTimeError("Game time is required")
      isValid = false
    }

    // Validate that there are players in the rankings
    if (rankingPlayers.length === 0) {
      setError("Please add at least one player to the rankings")
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
      // Prepare form data
      const formData = new FormData()
      formData.append("seriesId", seriesId)
      formData.append("totalPlayers", totalPlayers.toString())
      formData.append("gameTime", gameTime)

      // Add player rankings with positions and points
      const rankings = rankingPlayers.map((player, index) => ({
        ...player,
        position: index + 1,
        points: Math.max(100 - index * 10, 10),
      }))

      formData.append("rankings", JSON.stringify(rankings))
      formData.append("bounties", JSON.stringify(bountyPlayers))
      formData.append("consolation", JSON.stringify(consolationPlayers))

      // Call the server action
      const result = await saveGameResults(formData)

      if (result.success) {
        setState("success")

        // After 1 second, redirect to results page
        setTimeout(() => {
          router.push("/results")
        }, 1000)
      } else {
        setState("error")
        setError(result.error || "An error occurred while recording the tournament results. Please try again.")
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      setState("error")
      setError("An error occurred while recording the tournament results. Please try again.")
    }
  }

  const breadcrumbItems = [{ label: "Tournaments", href: "/results" }, { label: "Record Results" }]

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
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
                    min={rankingPlayers.length > 0 ? rankingPlayers.length : 1}
                    value={totalPlayers || ""}
                    onChange={(e) => setTotalPlayers(Number.parseInt(e.target.value) || 0)}
                    className={`material-input ${totalPlayersError ? "border-destructive" : ""}`}
                    disabled={state === "submitting"}
                  />
                  {totalPlayersError ? (
                    <p className="text-destructive text-xs mt-1">{totalPlayersError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      Must be at least equal to the number of ranked players ({rankingPlayers.length})
                    </p>
                  )}
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
                  {rankingPlayers.length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-gray-200 rounded-md">
                      <p className="text-muted-foreground">Add players to rankings first to select bounties</p>
                    </div>
                  ) : (
                    <PlayerAutoSuggest
                      onSelect={(player) => handleAddPlayer(player, "bounties")}
                      existingPlayers={rankingPlayers.filter(
                        (player) => !bountyPlayers.some((p) => p.id === player.id),
                      )}
                      placeholder="Select players from rankings to add as bounties"
                      helperText="Only players from the rankings can be added as bounties"
                    />
                  )}

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
    </>
  )
}
