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
import { FormSubmissionState, type FormSubmissionState as FormState } from "@/components/ui/form-submission-state"

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
  const [allPlayers, setAllPlayers] = useState<Player[]>([])

  // Form fields
  const [seriesId, setSeriesId] = useState("")
  const [totalPlayers, setTotalPlayers] = useState<number>(0)
  const [gameType, setGameType] = useState<"Tournament" | "Consolation">("Tournament")
  const [gameTime, setGameTime] = useState<string>(() => {
    const now = new Date()
    return `${now.toISOString().split("T")[0]}T${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
  })

  // Player sections
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

          setAllPlayers(playersList)
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

  // Update the getAvailablePlayersForSection function to allow all players for bounties
  const getAvailablePlayersForSection = (section: "rankings" | "bounties" | "consolation") => {
    if (section === "rankings") {
      // For rankings, filter out players already in rankings
      return allPlayers.filter((player) => !rankingPlayers.some((p) => p.id === player.id))
    } else if (section === "bounties") {
      // For bounties, use all players but filter out those already in bounties
      return allPlayers.filter((player) => !bountyPlayers.some((p) => p.id === player.id))
    } else if (section === "consolation") {
      // For consolation, use all players but filter out those already in consolation
      return allPlayers.filter((player) => !consolationPlayers.some((p) => p.id === player.id))
    }
    return []
  }

  // Update the handleAddPlayer function to allow any player to be added as a bounty
  const handleAddPlayer = (player: Player, section: "rankings" | "bounties" | "consolation") => {
    // If player is already in the target section, do nothing
    if (
      (section === "rankings" && rankingPlayers.some((p) => p.id === player.id)) ||
      (section === "bounties" && bountyPlayers.some((p) => p.id === player.id)) ||
      (section === "consolation" && consolationPlayers.some((p) => p.id === player.id))
    ) {
      return
    }

    // Add player to the appropriate section
    if (section === "rankings") {
      const newRankingPlayers = [...rankingPlayers, player]
      setRankingPlayers(newRankingPlayers)

      // Auto-update total players if needed
      if (newRankingPlayers.length > totalPlayers) {
        setTotalPlayers(newRankingPlayers.length)
      }
    } else if (section === "bounties") {
      setBountyPlayers([...bountyPlayers, player])
    } else if (section === "consolation") {
      setConsolationPlayers([...consolationPlayers, player])
    }
  }

  // Update the handleRemovePlayer function to not check if player is in rankings when removing from bounties
  const handleRemovePlayer = (player: Player, section: "rankings" | "bounties" | "consolation") => {
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
      formData.append("gameType", gameType)

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
        }, 1500)
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
        {/* Form Submission State Overlay */}
        <FormSubmissionState
          state={state}
          title="Tournament Results"
          icon={<Trophy className="h-8 w-8 text-green-600" />}
          successTitle="Results Recorded Successfully!"
          successMessage="The tournament results have been saved."
          errorMessage={error}
          redirectMessage="Redirecting to tournaments page..."
        />

        <div className="material-card">
          <div className="material-card-header">
            <h2 className="material-card-title flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Record Tournament Results
            </h2>
            <p className="material-card-subtitle">Record the results of a completed tournament</p>
          </div>

          <form onSubmit={handleSubmit} className="material-card-content space-y-6">
            {state === "error" && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            )}

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

            {/* Game Type - Main Focus */}
            <div className="border border-gray-200 rounded-md p-4">
              <label htmlFor="gameType" className="material-label">
                Game Type*
              </label>
              <select
                id="gameType"
                value={gameType}
                onChange={(e) => setGameType(e.target.value as "Tournament" | "Consolation")}
                className="material-input"
                disabled={state === "submitting"}
              >
                <option value="Tournament">Tournament</option>
                <option value="Consolation">Consolation</option>
              </select>
                <p className="text-xs text-muted-foreground mt-1">
                {gameType === "Tournament" 
                  ? "Top 10 players get points: players × (11 - rank)" 
                  : "Top 3 players get fixed points: 100, 50, 25"}
              </p>
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
                  existingPlayers={getAvailablePlayersForSection("rankings")}
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
                  existingPlayers={getAvailablePlayersForSection("bounties")}
                  placeholder="Search players to add as bounties"
                  helperText="Add players who were bounties in this tournament"
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
                          disabled={state === "submitting"}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Game Details - Rarely Updated */}
            <div className="border-t border-gray-200 pt-6 mt-8">
              <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">Game Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="totalPlayers" className="material-label">
                    Total Players*
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Mobile increment/decrement buttons */}
                    <button
                      type="button"
                      onClick={() => setTotalPlayers(Math.max(rankingPlayers.length, totalPlayers - 1))}
                      className="md:hidden flex items-center justify-center w-10 h-10 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={state === "submitting" || totalPlayers <= rankingPlayers.length}
                    >
                      <span className="text-lg font-medium">−</span>
                    </button>
                    
                    <input
                      id="totalPlayers"
                      type="number"
                      min={rankingPlayers.length > 0 ? rankingPlayers.length : 1}
                      value={totalPlayers || ""}
                      onChange={(e) => setTotalPlayers(Number.parseInt(e.target.value) || 0)}
                      className={`material-input flex-1 ${totalPlayersError ? "border-destructive" : ""}`}
                      disabled={state === "submitting"}
                    />
                    
                    {/* Mobile increment/decrement buttons */}
                    <button
                      type="button"
                      onClick={() => setTotalPlayers(totalPlayers + 1)}
                      className="md:hidden flex items-center justify-center w-10 h-10 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={state === "submitting"}
                    >
                      <span className="text-lg font-medium">+</span>
                    </button>
                  </div>
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
      </div>
    </>
  )
}
