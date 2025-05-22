"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getTournamentResultDetails, updateTournamentResult } from "@/app/__actions/results"
import { FormSubmissionState } from "@/components/ui/form-submission-state"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditTournamentResultPage() {
  const params = useParams()
  const router = useRouter()
  const tournamentId = params.id as string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTournament() {
      try {
        setLoading(true)
        const result = await getTournamentResultDetails(tournamentId)

        if (!result) {
          throw new Error("Failed to fetch tournament details")
        }

        setTournament(result)
      } catch (err) {
        console.error("Error fetching tournament:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (tournamentId) {
      fetchTournament()
    }
  }, [tournamentId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormState("submitting")
    setFormError(null)

    try {
      const formData = new FormData(event.currentTarget)

      const result = await updateTournamentResult(tournamentId, formData)

      if (!result.success) {
        throw new Error(result.error || "Failed to update tournament result")
      }

      setFormState("success")
      setTimeout(() => {
        router.push(`/results/${tournamentId}`)
      }, 1500)
    } catch (err) {
      console.error("Error updating tournament result:", err)
      setFormState("error")
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
        <p>{error || "Tournament not found"}</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/results/${tournamentId}`}>
          <button className="material-button-secondary flex items-center gap-1 text-sm py-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Tournament
          </button>
        </Link>
        <h1 className="text-2xl font-medium">Edit Tournament</h1>
      </div>

      <div className="material-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Tournament Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={tournament.name}
                required
                className="material-input"
              />
            </div>

            <div>
              <label htmlFor="gameTime" className="block text-sm font-medium mb-1">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="gameTime"
                name="gameTime"
                defaultValue={new Date(tournament.gameTime).toISOString().slice(0, 16)}
                required
                className="material-input"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                defaultValue={tournament.location || ""}
                className="material-input"
              />
            </div>

            <div>
              <label htmlFor="buyIn" className="block text-sm font-medium mb-1">
                Buy-in Amount
              </label>
              <input
                type="number"
                id="buyIn"
                name="buyIn"
                min="0"
                step="0.01"
                defaultValue={tournament.buyIn || 0}
                className="material-input"
              />
            </div>

            <div>
              <label htmlFor="prizePool" className="block text-sm font-medium mb-1">
                Prize Pool
              </label>
              <input
                type="number"
                id="prizePool"
                name="prizePool"
                min="0"
                step="0.01"
                defaultValue={tournament.prizePool || 0}
                className="material-input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href={`/results/${tournamentId}`}>
              <button type="button" className="material-button-secondary">
                Cancel
              </button>
            </Link>
            <button type="submit" className="material-button-primary bg-blue-600 hover:bg-blue-700 text-white" disabled={formState === "submitting"}>
              {formState === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

          <FormSubmissionState state={formState} errorMessage={formError as string} title="Edit Result" />
        </form>
      </div>
    </>
  )
}
