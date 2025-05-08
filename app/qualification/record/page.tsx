"use client"

import type React from "react"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Trophy, Loader2, AlertCircle, Users, Calendar } from "lucide-react"
 import Link from "next/link"
import { DraggablePlayerList } from "@/components/dashboard/draggable-player-list"
import { FloatingActionButton } from "@/components/ui/floating-action-button"

type FormState = "idle" | "submitting" | "success" | "error"

interface Player {
  id: string
  name: string
  chips: number
}

// Mock data for qualified players
const QUALIFIED_PLAYERS: Player[] = [
  { id: "1", name: "Player A", chips: 25000 },
  { id: "2", name: "Player B", chips: 22000 },
  { id: "3", name: "Player C", chips: 20000 },
  { id: "4", name: "Player D", chips: 18000 },
  { id: "5", name: "Player E", chips: 17500 },
  { id: "6", name: "Player F", chips: 16000 },
  { id: "7", name: "Player G", chips: 15000 },
  { id: "8", name: "Player H", chips: 14000 },
  { id: "9", name: "Player I", chips: 13500 },
  { id: "10", name: "Player J", chips: 12000 },
]

export default function RecordSeasonEventPage() {
  const [state, setState] = useState<FormState>("idle")
  const [error, setError] = useState("")
  const [finalRankings, setFinalRankings] = useState<Player[]>([...QUALIFIED_PLAYERS])
  const [eventDate, setEventDate] = useState<string>(() => {
    const now = new Date()
    return now.toISOString().split("T")[0]
  })
  const [seasonId, ] = useState("2") // Summer Season 2023
  const [eventName, setEventName] = useState("Summer Season 2023 - Season Event")
  const [totalPlayers, ] = useState(QUALIFIED_PLAYERS.length)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState("submitting")
    setError("")

    try {
      // This would be replaced with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create results object
      const results = {
        eventName,
        seasonId,
        eventDate,
        totalPlayers,
        finalRankings: finalRankings.map((player, index) => ({
          ...player,
          position: index + 1,
          prize: index === 0 ? 1200 : index === 1 ? 800 : index === 2 ? 500 : index === 3 ? 300 : index === 4 ? 200 : 0,
        })),
      }

      console.log("Recording season event results:", results)

      // For demo purposes, show success state
      setState("success")

      // After 1 second, redirect to qualification page
      setTimeout(() => {
        window.location.href = "/qualification"
      }, 1000)
    } catch (err) {
        console.error("Error recording results:", err)
      setState("error")
      setError("An error occurred while recording the results. Please try again.")
    }
  }

  const breadcrumbItems = [{ label: "Season Event", href: "/qualification" }, { label: "Record Results" }]

  return (
    <AppLayout title="Record Season Event Results" breadcrumbs={<Breadcrumb items={breadcrumbItems} />}>
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
            <p className="text-muted-foreground mb-6">The season event results have been saved.</p>
            <p className="text-sm text-muted-foreground">Redirecting to season event page...</p>
          </div>
        ) : (
          <div className="material-card">
            <div className="material-card-header">
              <h2 className="material-card-title flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Record Season Event Results
              </h2>
              <p className="material-card-subtitle">Record the final standings from the season event</p>
            </div>

            <form onSubmit={handleSubmit} className="material-card-content space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="eventName" className="material-label">
                    Event Name
                  </label>
                  <input
                    id="eventName"
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="material-input"
                    disabled={state === "submitting"}
                  />
                </div>

                <div>
                  <label htmlFor="eventDate" className="material-label flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Event Date
                  </label>
                  <input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="material-input"
                    disabled={state === "submitting"}
                  />
                </div>
              </div>

              <div>
                <label className="material-label flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Final Rankings
                </label>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop players to arrange them in their final finishing order (1st place at the top)
                </p>

                <DraggablePlayerList
                  players={finalRankings.map((p) => ({
                    id: p.id,
                    name: `${p.name} (${p.chips.toLocaleString()} chips)`,
                  }))}
                  onPlayersChange={(players) => {
                    // Map back to original player objects with chips
                    const updatedRankings = players.map((p) => {
                      const originalPlayer = QUALIFIED_PLAYERS.find((op) => op.id === p.id)
                      return {
                        id: p.id,
                        name: originalPlayer?.name || p.name.split(" (")[0],
                        chips: originalPlayer?.chips || 0,
                      }
                    })
                    setFinalRankings(updatedRankings)
                  }}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Link href="/qualification">
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
      <FloatingActionButton />
    </AppLayout>
  )
}
