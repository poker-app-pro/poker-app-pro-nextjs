"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Calendar, Loader2, AlertCircle, HelpCircle } from "lucide-react"
import { client } from "@/components/AmplifyClient"
import { getCurrentUser } from "aws-amplify/auth"
import { createSeason } from "@/app/__actions/seasons"
import { FormSubmissionState, type FormSubmissionState as FormState } from "@/components/ui/form-submission-state"

type PointsSystem = "weighted" | "custom"

interface League {
  id: string
  name: string
}

export default function CreateSeasonPage() {
  const router = useRouter()

  const [state, setState] = useState<FormState>("idle")
  const [error, setError] = useState("")

  // Form fields
  const [name, setName] = useState("")
  const [leagueId, setLeagueId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [pointsSystem, setPointsSystem] = useState<PointsSystem>("weighted")
  const [customPointsConfig, setCustomPointsConfig] = useState("")

  // Data fetching
  const [leagues, setLeagues] = useState<League[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Validation errors
  const [nameError, setNameError] = useState("")
  const [leagueError, setLeagueError] = useState("")
  const [startDateError, setStartDateError] = useState("")
  const [endDateError, setEndDateError] = useState("")
  const [customPointsError, setCustomPointsError] = useState("")

  // Fetch leagues
  useEffect(() => {
    async function fetchLeagues() {
      try {
        const leaguesResult = await client.models.League.list({
          authMode: "userPool",
          filter: { isActive: { eq: true } },
          selectionSet: ["id", "name"],
        })

        if (leaguesResult.data) {
          setLeagues(leaguesResult.data)
        }
      } catch (error) {
        console.error("Error fetching leagues:", error)
        setError("Failed to load leagues")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeagues()
  }, [])

  const validateForm = (): boolean => {
    let isValid = true

    // Reset errors
    setNameError("")
    setLeagueError("")
    setStartDateError("")
    setEndDateError("")
    setCustomPointsError("")

    // Validate name
    if (!name.trim()) {
      setNameError("Season name is required")
      isValid = false
    }

    // Validate league
    if (!leagueId) {
      setLeagueError("Please select a league")
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

      // Create form data
      const formData = new FormData()
      formData.append("name", name)
      formData.append("leagueId", leagueId)
      formData.append("startDate", startDate)
      if (endDate) formData.append("endDate", endDate)
      if (description) formData.append("description", description)
      if (isActive) formData.append("isActive", "on")
      formData.append("pointsSystem", pointsSystem)
      if (pointsSystem === "custom" && customPointsConfig) {
        formData.append("customPointsConfig", customPointsConfig)
      }
      formData.append("userId", user.userId)

      // Call server action
      const result = await createSeason(formData)

      if (result.success) {
        setState("success")

        // Redirect to seasons page
        setTimeout(() => {
          router.push("/seasons")
        }, 1500)
      } else {
        throw new Error(result.error || "Failed to create season")
      }
    } catch (err) {
      console.error(err)
      setState("error")
      setError("An error occurred while creating the season. Please try again.")
    }
  }

  const breadcrumbItems = [{ label: "Seasons", href: "/seasons" }, { label: "Create Season" }]

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="max-w-3xl mx-auto">
        {/* Form Submission State Overlay */}
        <FormSubmissionState
          state={state}
          title="Season"
          icon={<Calendar className="h-8 w-8 text-green-600" />}
          successTitle="Season Created Successfully!"
          successMessage="Your new season has been created."
          errorMessage={error}
          redirectMessage="Redirecting to seasons page..."
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="material-card">
            <div className="material-card-header">
              <h2 className="material-card-title flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Create New Season
              </h2>
              <p className="material-card-subtitle">Seasons organize series and tournaments over a period of time</p>
            </div>

            <form onSubmit={handleSubmit} className="material-card-content space-y-6">
              {state === "error" && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="league" className="material-label">
                  League*
                </label>
                <select
                  id="league"
                  value={leagueId}
                  onChange={(e) => setLeagueId(e.target.value)}
                  className={`material-input ${leagueError ? "border-destructive" : ""}`}
                  disabled={state === "submitting"}
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
                <label htmlFor="name" className="material-label">
                  Season Name*
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`material-input ${nameError ? "border-destructive" : ""}`}
                  placeholder="e.g., Summer 2024"
                  disabled={state === "submitting"}
                />
                {nameError && <p className="text-destructive text-xs mt-1">{nameError}</p>}
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
                  {startDateError && <p className="text-destructive text-xs mt-1">{startDateError}</p>}
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
                    <p className="text-xs text-muted-foreground mt-1">Leave blank for ongoing season</p>
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
                  placeholder="Describe this season..."
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
                    className={`material-input min-h-[100px] font-mono text-sm ${customPointsError ? "border-destructive" : ""}`}
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
                  Season is active
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/seasons")}
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
                    "Create Season"
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
