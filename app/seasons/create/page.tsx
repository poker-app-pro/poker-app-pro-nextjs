"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Calendar, Loader2, AlertCircle } from "lucide-react"
import { useHierarchy } from "@/contexts/hierarchy-context"
import { client } from "@/components/AmplifyClient";
import { getCurrentUser } from "aws-amplify/auth"

type FormState = "idle" | "submitting" | "success" | "error"

// Mock data for leagues
const MOCK_LEAGUES = [
  { id: "1", name: "Texas Hold'em League" },
  { id: "2", name: "Omaha League" },
  { id: "3", name: "Seven Card Stud League" },
]

export default function CreateSeasonPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { activeLeague } = useHierarchy()

  const [state, setState] = useState<FormState>("idle")
  const [error, setError] = useState("")

  // Form fields
  const [name, setName] = useState("")
  const [leagueId, setLeagueId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)

  // Validation errors
  const [nameError, setNameError] = useState("")
  const [leagueError, setLeagueError] = useState("")
  const [startDateError, setStartDateError] = useState("")

  // Set default start date to today
  useEffect(() => {
    const today = new Date()
    setStartDate(today.toISOString().split("T")[0])

    // Set league ID from query params or active league
    const leagueIdFromQuery = searchParams.get("leagueId")
    if (leagueIdFromQuery) {
      setLeagueId(leagueIdFromQuery)
    } else if (activeLeague) {
      setLeagueId(activeLeague.id)
    }
  }, [searchParams, activeLeague])

  const validateForm = (): boolean => {
    let isValid = true

    // Reset errors
    setNameError("")
    setLeagueError("")
    setStartDateError("")

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

    // Validate end date is after start date
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      setStartDateError("End date must be after start date")
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }
    const user = await getCurrentUser();

    setState("submitting")
    setError("")

    try {
      // This would be replaced with actual API call
      // Simulate API call
      await client.models.Season.create({
        name,
        leagueId,
        startDate,
        endDate: endDate || null,
        description,
        isActive,
        userId: user?.userId,
      }, {
        authMode: "userPool",
      })

      // Create season object
      const season = {
        name,
        leagueId,
        startDate,
        endDate: endDate || null,
        description,
        isActive,
        // In a real app, userId would come from auth context
        userId: "current-user-id",
      }

      console.log("Creating season:", season)

      // For demo purposes, show success state
      setState("success")

      // After 1 second, redirect to seasons page
      setTimeout(() => {
        router.push("/seasons")
      }, 1000)
    } catch (err) {
      console.log(err)
      setState("error")
      setError("An error occurred while creating the season. Please try again.")
    }
  }

  const breadcrumbItems = [{ label: "Seasons", href: "/seasons" }, { label: "Create Season" }]

  return (
    <AppLayout title="Create Season" breadcrumbs={<Breadcrumb items={breadcrumbItems} />}>
      <div className="max-w-3xl mx-auto">
        {state === "error" && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        <div className="material-card">
          <div className="material-card-header">
            <h2 className="material-card-title flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Create New Season
            </h2>
            <p className="material-card-subtitle">Seasons group series and tournaments within a specific time period</p>
          </div>

          <form onSubmit={handleSubmit} className="material-card-content space-y-6">
            <div>
              <label htmlFor="league" className="material-label">
                League*
              </label>
              <select
                id="league"
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
                className={`material-input ${leagueError ? "border-destructive" : ""}`}
                disabled={state === "submitting" || !!activeLeague}
              >
                <option value="">Select a league</option>
                {MOCK_LEAGUES.map((league) => (
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
                placeholder="e.g., Summer Season 2024"
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
                  className="material-input"
                  disabled={state === "submitting"}
                />
                <p className="text-xs text-muted-foreground mt-1">Leave blank for ongoing seasons</p>
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
      </div>
    </AppLayout>
  )
}
