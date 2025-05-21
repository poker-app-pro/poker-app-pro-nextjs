"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
 import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Star, Loader2, AlertCircle, HelpCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { client } from "@/components/AmplifyClient"
import { getCurrentUser } from "aws-amplify/auth"
import { FormSubmissionState, type FormSubmissionState as FormState } from "@/components/ui/form-submission-state"

type PointsSystem = "weighted" | "custom"

export default function EditSeriesPage() {
  const params = useParams()
  const router = useRouter()
  const seriesId = params.id as string

  const [state, setState] = useState<FormState>("idle")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Form fields
  const [name, setName] = useState("")
  const [leagueId, setLeagueId] = useState("")
  const [seasonId, setSeasonId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [pointsSystem, setPointsSystem] = useState<PointsSystem>("weighted")
  const [customPointsConfig, setCustomPointsConfig] = useState("")

  // Data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leagues, setLeagues] = useState<any[]>([])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [seasons, setSeasons] = useState<any[]>([])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ , setFilteredSeasons] = useState<any[]>([])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedSeason, setSelectedSeason] = useState<any | null>(null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [series, setSeries] = useState<any | null>(null)

  // Validation errors
  const [nameError, setNameError] = useState("")
  const [startDateError, setStartDateError] = useState("")
  const [endDateError, setEndDateError] = useState("")
  const [customPointsError, setCustomPointsError] = useState("")

  // Fetch series data and related entities
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Fetch series data
        const seriesResult = await client.models.Series.get({ id: seriesId }, { authMode: "userPool" })

        if (!seriesResult.data) {
          throw new Error("Series not found")
        }

        const seriesData = seriesResult.data
        setSeries(seriesData)

        // Set form fields
        setName(seriesData.name)
        setLeagueId(seriesData.leagueId)
        setSeasonId(seriesData.seasonId)
        setStartDate(seriesData.startDate ? seriesData.startDate.split("T")[0] : "")
        setEndDate(seriesData.endDate ? seriesData.endDate.split("T")[0] : "")
        setDescription(seriesData.description || "")
        setIsActive(seriesData.isActive !== undefined ? (seriesData.isActive as boolean) : true)
        setPointsSystem((seriesData.pointsSystem as PointsSystem) || "weighted")

        if (seriesData.customPointsConfig && seriesData.pointsSystem === "custom") {
          setCustomPointsConfig(JSON.stringify(seriesData.customPointsConfig, null, 2))
        }

        // Fetch leagues
        const leaguesResult = await client.models.League.list({
          authMode: "userPool",
          filter: { isActive: { eq: true } },
        })

        if (leaguesResult.data) {
          setLeagues(leaguesResult.data)
        }

        // Fetch seasons
        const seasonsResult = await client.models.Season.list({
          authMode: "userPool",
          filter: { isActive: { eq: true } },
        })

        if (seasonsResult.data) {
          setSeasons(seasonsResult.data)

          // Filter seasons by league
          const filtered = seasonsResult.data.filter((season) => season.leagueId === seriesData.leagueId)
          setFilteredSeasons(filtered)

          // Set selected season
          const season = seasonsResult.data.find((s) => s.id === seriesData.seasonId)
          setSelectedSeason(season || null)
        }
      } catch (error) {
        console.error("Error fetching series data:", error)
        setError("Failed to load series data")
      } finally {
        setIsLoading(false)
      }
    }

    if (seriesId) {
      fetchData()
    }
  }, [seriesId])

  // Filter seasons when league changes
  useEffect(() => {
    if (leagueId && seasons.length > 0) {
      const filtered = seasons.filter((season) => season.leagueId === leagueId)
      setFilteredSeasons(filtered)

      // Clear selected season if it's not in the filtered list
      if (seasonId && !filtered.some((s) => s.id === seasonId)) {
        setSeasonId("")
        setSelectedSeason(null)
      }
    }
  }, [leagueId, seasons, seasonId])

  // Update selected season when season changes
  useEffect(() => {
    if (seasonId && seasons.length > 0) {
      const season = seasons.find((s) => s.id === seasonId) || null
      setSelectedSeason(season)
    }
  }, [seasonId, seasons])

  const validateForm = (): boolean => {
    let isValid = true

    // Reset errors
    setNameError("")
    setStartDateError("")
    setEndDateError("")
    setCustomPointsError("")

    // Validate name
    if (!name.trim()) {
      setNameError("Series name is required")
      isValid = false
    }

    // Validate start date
    if (!startDate) {
      setStartDateError("Start date is required")
      isValid = false
    }

    // Validate end date is after start date (if provided)
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      setEndDateError("End date must be after start date")
      isValid = false
    }

    // Validate custom points config
    if (pointsSystem === "custom") {
      try {
        if (!customPointsConfig.trim()) {
          setCustomPointsError("Custom points configuration is required")
          isValid = false
        } else {
          JSON.parse(customPointsConfig)
        }
      } catch (err) {
        console.error(err)
        setCustomPointsError("Invalid JSON format")
        isValid = false
      }
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

      // Update the series
      const result = await client.models.Series.update(
        {
          id: seriesId,
          name,
          startDate: startDate,
          endDate: endDate || undefined,
          description,
          isActive,
          pointsSystem,
          customPointsConfig:
            pointsSystem === "custom" && customPointsConfig ? JSON.parse(customPointsConfig) : undefined,
        },
        {
          authMode: "userPool",
        },
      )

      if (!result.data) {
        throw new Error("Failed to update series")
      }

      // Log activity
      try {
        await client.models.ActivityLog.create(
          {
            userId: user.userId,
            action: "UPDATE",
            entityType: "Series",
            entityId: seriesId,
            details: {
              name,
              seasonId,
              leagueId,
            },
            timestamp: new Date().toISOString(),
          },
          {
            authMode: "userPool",
          },
        )
      } catch (logError) {
        console.error("Error logging activity:", logError)
        // Continue execution even if logging fails
      }

      setState("success")

      // Redirect back to series details page
      setTimeout(() => {
        router.push(`/series/${seriesId}`)
      }, 1500)
    } catch (err) {
      console.error("Error updating series:", err)
      setState("error")
      setError("An error occurred while updating the series. Please try again.")
    }
  }

  const breadcrumbItems = [
    { label: "Series", href: "/series" },
    { label: series?.name || "Series Details", href: `/series/${seriesId}` },
    { label: "Edit" },
  ]

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="max-w-3xl mx-auto">
        {/* Form Submission State Overlay */}
        <FormSubmissionState
          state={state}
          title="Series"
          icon={<Star className="h-8 w-8 text-green-600" />}
          successTitle="Series Updated Successfully!"
          successMessage="Your series has been updated."
          errorMessage={error}
          redirectMessage="Redirecting to series details..."
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="material-card">
            <div className="material-card-header">
              <div className="flex items-center gap-2 mb-2">
                <Link href={`/series/${seriesId}`}>
                  <button className="material-button-secondary flex items-center gap-1 text-sm py-1">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                </Link>
              </div>
              <h2 className="material-card-title flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Edit Series
              </h2>
              <p className="material-card-subtitle">Update series details</p>
            </div>

            <form onSubmit={handleSubmit} className="material-card-content space-y-6">
              {state === "error" && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              )}

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
                  <label htmlFor="league" className="material-label">
                    League
                  </label>
                  <input
                    type="text"
                    value={leagues.find((l) => l.id === leagueId)?.name || ""}
                    className="material-input"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">League cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="season" className="material-label">
                    Season
                  </label>
                  <input
                    type="text"
                    value={seasons.find((s) => s.id === seasonId)?.name || ""}
                    className="material-input"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">Season cannot be changed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="material-label">
                    Start Date*
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
                    selectedSeason?.startDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Season starts: {new Date(selectedSeason.startDate).toLocaleDateString()}
                      </p>
                    )
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

              <div>
                <label htmlFor="pointsSystem" className="material-label flex items-center gap-2">
                  Points System
                  <div className="relative group">
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    <div className="absolute left-full ml-2 top-0 w-64 p-2 bg-white border border-gray-200 rounded shadow-md hidden group-hover:block z-10 text-xs">
                      <p>
                        <strong>Weighted:</strong> Points = total players * (11-rank), only top 10 players receive
                        points
                      </p>
                      <p>
                        <strong>Custom:</strong> Define your own points structure
                      </p>
                    </div>
                  </div>
                </label>
                <select
                  id="pointsSystem"
                  value={pointsSystem}
                  onChange={(e) => setPointsSystem(e.target.value as PointsSystem)}
                  className="material-input"
                  disabled={state === "submitting"}
                >
                  <option value="weighted">Weighted</option>
                  <option value="custom">Custom</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>Note:</strong> Changing the points system will only affect future tournaments.
                </p>
              </div>

              {pointsSystem === "custom" && (
                <div>
                  <label htmlFor="customPointsConfig" className="material-label">
                    Custom Points Configuration (JSON)
                  </label>
                  <textarea
                    id="customPointsConfig"
                    value={customPointsConfig}
                    onChange={(e) => setCustomPointsConfig(e.target.value)}
                    className={`material-input min-h-[100px] font-mono text-sm ${
                      customPointsError ? "border-destructive" : ""
                    }`}
                    placeholder='{"1": 100, "2": 90, "3": 80, "4": 70, "5": 60}'
                    disabled={state === "submitting"}
                  />
                  {customPointsError && <p className="text-destructive text-xs mt-1">{customPointsError}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a JSON object with position numbers as keys and point values as values
                  </p>
                </div>
              )}

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
                <Link href={`/series/${seriesId}`}>
                  <button type="button" className="material-button-secondary" disabled={state === "submitting"}>
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  className="material-button-primary bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  disabled={state === "submitting"}
                >
                  {state === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Series"
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
