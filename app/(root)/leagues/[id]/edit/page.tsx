"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getLeague, updateLeague } from "@/app/__actions/league"
import { FormSubmissionState } from "@/components/ui/form-submission-state"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditLeaguePage() {
  const params = useParams()
  const router = useRouter()
  const leagueId = params.id as string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [league, setLeague] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [formError, setFormError] = useState<string | null>(null)
  const [ownerId, setOwnerId] = useState<string>("")

  useEffect(() => {
    async function fetchLeague() {
      try {
        setLoading(true)
        const result = await getLeague(leagueId)

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to fetch league")
        }

        setLeague(result.data)
        setOwnerId(result.data.ownerId)
      } catch (err) {
        console.error("Error fetching league:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (leagueId) {
      fetchLeague()
    }
  }, [leagueId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormState("submitting")
    setFormError(null)

    try {
      const formData = new FormData(event.currentTarget)
      formData.append("ownerId", ownerId)

      const result = await updateLeague(leagueId, formData)

      if (!result.success) {
        throw new Error(result.error || "Failed to update league")
      }

      setFormState("success")
      setTimeout(() => {
        router.push(`/leagues/${leagueId}`)
      }, 1500)
    } catch (err) {
      console.error("Error updating league:", err)
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

  if (error || !league) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
        <p>{error || "League not found"}</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/leagues/${leagueId}`}>
          <button className="material-button-secondary flex items-center gap-1 text-sm py-1">
            <ArrowLeft className="h-4 w-4" />
            Back to League
          </button>
        </Link>
        <h1 className="text-2xl font-medium">Edit League</h1>
      </div>

      <div className="material-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                League Name <span className="text-red-500">*</span>
              </label>
              <input type="text" id="name" name="name" defaultValue={league.name} required className="material-input" />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={league.description || ""}
                className="material-input"
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                Image URL
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                defaultValue={league.imageUrl || ""}
                className="material-input"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                defaultChecked={league.isActive}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm">
                Active League
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href={`/leagues/${leagueId}`}>
              <button type="button" className="material-button-secondary">
                Cancel
              </button>
            </Link>
            <button type="submit" className="material-button-primary" disabled={formState === "submitting"}>
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

          <FormSubmissionState state={formState} errorMessage={formError as string} title="Edit League" />
        </form>
      </div>
    </>
  )
}
