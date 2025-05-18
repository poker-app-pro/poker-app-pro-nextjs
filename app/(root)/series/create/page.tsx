"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Star, Loader2, AlertCircle } from "lucide-react"
import { useHierarchy } from "@/contexts/hierarchy-context"
import { client } from "@/components/AmplifyClient"
import { getCurrentUser } from "aws-amplify/auth"
import { createSeries } from "@/app/__actions/series"

type FormState = "idle" | "submitting" | "success" | "error"

interface League {
  id: string
  name: string
}

interface Season {
  id: string
  name: string
  leagueId: string
  startDate?: string
  endDate?: string | null
}

export default function CreateSeriesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { activeLeague, activeSeason } = useHierarchy()

  const [state, setState] = useState<FormState>("idle")
  const [error, setError] = useState("")

  // Form fields
  const [name, setName] = useState("")
  const [leagueId, setLeagueId] = useState("")
  const [seasonId, setSeasonId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)

  // Data fetching
  const [leagues, setLeagues] = useState<League[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [filteredSeasons, setFilteredSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Validation errors
  const [nameError, setNameError] = useState("")
  const [leagueError, setLeagueError] = useState("")
  const [seasonError, setSeasonError] = useState("")
  const [startDateError, setStartDateError] = useState("")
  const [endDateError, setEndDateError] = useState("")

  // Fetch leagues and seasons
  useEffect(() => {
    async function fetchData() {
      try {
        const leaguesResult = await client.models.League.list({
          authMode: "userPool",
          filter: { isActive: { eq: true } },
          selectionSet: ["id", "name"],
        })

        const seasonsResult = await client.models.Season.list({
          authMode: "userPool",
          filter: { isActive: { eq: true } },
          selectionSet: ["id", "name", "leagueId", "startDate", "endDate"],
        })

        if (leaguesResult.data) {
          setLeagues(leaguesResult.data)
        }

        if (seasonsResult.data) {
          setSeasons(seasonsResult.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load leagues and seasons")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle query params and set default values
  useEffect(() => {
    // Set league ID from query params or active league
    const leagueIdFromQuery = searchParams.get("leagueId")
    if (leagueIdFromQuery) {
      setLeagueId(leagueIdFromQuery)
    } else if (activeLeague) {
      setLeagueId(activeLeague.id)
    }

    // Set season ID from query params or active season
    const seasonIdFromQuery = searchParams.get("seasonId")
    if (seasonIdFromQuery) {
      setSeasonId(seasonIdFromQuery)
    } else if (activeSeason) {
      setSeasonId(activeSeason.id)
    }
  }, [searchParams, activeLeague, activeSeason])

  // Filter seasons when league changes
  useEffect(() => {
    if (leagueId) {
      const filtered = seasons.filter((season) => season.leagueId === leagueId)
      setFilteredSeasons(filtered)

      // Clear selected season if it's not in the filtered list
      if (seasonId && !filtered.some((s) => s.id === seasonId)) {
        setSeasonId("")
        setSelectedSeason(null)
      }
    } else {
      setFilteredSeasons(seasons)
    }
  }, [leagueId, seasons, seasonId])

  // Update selected season and set default dates when season changes
  useEffect(() => {
    if (seasonId) {
      const season = seasons.find((s) => s.id === seasonId) || null
      setSelectedSeason(season)

      if (season?.startDate) {
        // Default start date to season start date
        setStartDate(season.startDate)
      }

      // Clear any previous errors
      setStartDateError("")
      setEndDateError("")
    } else {
      setSelectedSeason(null)
    }
  }, [seasonId, seasons])

  const validateForm = (): boolean => {
    let isValid = true

    // Reset errors
    setNameError("")
    setLeagueError("")
    setSeasonError("")
    setStartDateError("")
    setEndDateError("")

    // Validate name
    if (!name.trim()) {
      setNameError("Series name is required")
      isValid = false
    }

    // Validate league
    if (!leagueId) {
      setLeagueError("Please select a league")
      isValid = false
    }

    // Validate season
    if (!seasonId) {
      setSeasonError("Please select a season")
      isValid = false
    }

    // Validate dates against season constraints
    if (selectedSeason) {
      // If start date is provided, validate it's not before season start
      if (startDate) {
        const seriesStartDate = new Date(startDate)

        if (selectedSeason.startDate) {
          const seasonStartDate = new Date(selectedSeason.startDate)
          if (seriesStartDate < seasonStartDate) {
            setStartDateError(`Start date cannot be before season start (${selectedSeason.startDate})`)
            isValid = false
          }
        }
      } else {
        // If start date is not provided, we'll use season start date
        // No validation error needed
      }

      // If end date is provided, validate it's not after season end (if season end exists)
      if (endDate && selectedSeason.endDate) {
        const seriesEndDate = new Date(endDate)
        const seasonEndDate = new Date(selectedSeason.endDate)

        if (seriesEndDate > seasonEndDate) {
          setEndDateError(`End date cannot be after season end (${selectedSeason.endDate})`)
          isValid = false
        }
      }
    }

    // Validate end date is after start date (if both are provided)
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      setEndDateError("End date must be after start date")
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
      const user = await getCurrentUser()

      // Create form data
      const formData = new FormData()
      formData.append("name", name)
      formData.append("leagueId", leagueId)
      formData.append("seasonId", seasonId)

      // Use season start date if start date is not provided
      const finalStartDate = startDate || selectedSeason?.startDate || new Date().toISOString().split("T")[0]
      formData.append("startDate", finalStartDate)

      if (endDate) formData.append("endDate", endDate)
      if (description) formData.append("description", description)
      if (isActive) formData.append("isActive", "on")

      // Points system is now managed at the season level
      // Default to weighted scoring algorithm: points = total players * (11-rank), top 10 only
      formData.append("pointsSystem", "weighted")

      formData.append("userId", user.userId)

      // Call server action
      const result = await createSeries(formData)

      if (result.success) {
        setState("success")

        // Redirect to series page
        setTimeout(() => {
          router.push("/series")
        }, 1000)
      } else {
        throw new Error(result.error || "Failed to create series")
      }
    } catch (err) {
      console.error(err)
      setState("error")
      setError("An error occurred while creating the series. Please try again.")
    }
  }

  const breadcrumbItems = [{ label: "Series", href: "/series" }, { label: "Create Series" }]

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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="material-card">
            <div className="material-card-header">
              <h2 className="material-card-title flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Create New Series
              </h2>
              <p className="material-card-subtitle">Series group tournaments with a specific theme or format</p>
            </div>

            <form onSubmit={handleSubmit} className="material-card-content space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="league" className="material-label">
                    League*
                  </label>
                  <select
                    id="league"
                    value={leagueId}
                    onChange={(e) => {
                      setLeagueId(e.target.value)
                      setSeasonId("") // Reset season when league changes
                    }}
                    className={`material-input ${leagueError ? "border-destructive" : ""}`}
                    disabled={state === "submitting" || !!activeLeague}
                  >
                    <option value="">Select a league</option>
                    {leagues.map((league) => (
                      <option key={league.id} value={league.id}>
                        {league.name}
                      </option>
                    ))}
                  </select>
                  {leagueError && <p className="text-destructive text-xs mt-1">{leagueError}</p>}
                </div>

                <div>
                  <label htmlFor="season" className="material-label">
                    Season*
                  </label>
                  <select
                    id="season"
                    value={seasonId}
                    onChange={(e) => setSeasonId(e.target.value)}
                    className={`material-input ${seasonError ? "border-destructive" : ""}`}
                    disabled={state === "submitting" || !leagueId || !!activeSeason}
                  >
                    <option value="">Select a season</option>
                    {filteredSeasons.map((season) => (
                      <option key={season.id} value={season.id}>
                        {season.name}
                      </option>
                    ))}
                  </select>
                  {seasonError && <p className="text-destructive text-xs mt-1">{seasonError}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="name" className="material-label">
                  Series Name*
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`material-input ${nameError ? "border-destructive" : ""}`}
                  placeholder="e.g., Beginner Series"
                  disabled={state === "submitting"}
                />
                {nameError && <p className="text-destructive text-xs mt-1">{nameError}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="material-label">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`material-input ${startDateError ? "border-destructive" : ""}`}
                    disabled={state === "submitting"}
                  />
                  {startDateError ? (
                    <p className="text-destructive text-xs mt-1">{startDateError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Defaults to season start date if not specified</p>
                  )}
                  {selectedSeason?.startDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Season starts: {new Date(selectedSeason.startDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="material-label">
                    End Date (Optional)
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`material-input ${endDateError ? "border-destructive" : ""}`}
                    disabled={state === "submitting"}
                  />
                  {endDateError ? (
                    <p className="text-destructive text-xs mt-1">{endDateError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Leave blank for ongoing series</p>
                  )}
                  {selectedSeason?.endDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Season ends: {new Date(selectedSeason.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="material-label">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="material-input min-h-[100px]"
                  placeholder="Describe this series..."
                  disabled={state === "submitting"}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Points system is now configured at the season level. All series in this season
                  will use the weighted scoring algorithm where points = total players * (11-rank) and only the top 10
                  players receive points.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-200 text-primary focus:ring-primary"
                  disabled={state === "submitting"}
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-foreground">
                  Series is active
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/series")}
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
                      Creating...
                    </>
                  ) : (
                    "Create Series"
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
