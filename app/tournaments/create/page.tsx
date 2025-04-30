"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useHierarchy } from "@/contexts/hierarchy-context"
import { AppLayout } from "@/components/layout/app-layout"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { PlayerAutoSuggest } from "@/components/ui/player-auto-suggest"
import { DraggablePlayerList } from "@/components/dashboard/draggable-player-list"
import { Calendar, Clock, DollarSign, MapPin, Trophy } from "lucide-react"

interface Player {
  id: string
  name: string
  isNew?: boolean
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
]

export default function CreateTournamentPage() {
  const router = useRouter()
  const { activeLeague, activeSeason, activeSeries } = useHierarchy()

  const [tournamentName, setTournamentName] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [location, setLocation] = useState("")
  const [buyIn, setBuyIn] = useState("")
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set default tournament name based on active hierarchy
  useEffect(() => {
    if (activeSeries) {
      const tournamentCount = Math.floor(Math.random() * 5) + 1 // Mock data
      setTournamentName(`${activeSeries.name} Tournament #${tournamentCount + 1}`)
    }
  }, [activeSeries])

  // Set default date to today
  useEffect(() => {
    const today = new Date()
    setDate(today.toISOString().split("T")[0])

    // Set default time to current hour rounded up
    const hours = today.getHours()
    const minutes = today.getMinutes() > 30 ? "00" : "30"
    const formattedHours = hours.toString().padStart(2, "0")
    const nextHour = (hours + 1).toString().padStart(2, "0")
    setStartTime(minutes === "00" ? `${nextHour}:00` : `${formattedHours}:${minutes}`)
  }, [])

  const handleAddPlayer = (player: Player) => {
    if (!selectedPlayers.some((p) => p.id === player.id)) {
      setSelectedPlayers([...selectedPlayers, player])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, you would save the tournament data here
    console.log({
      name: tournamentName,
      date,
      startTime,
      location,
      buyIn: Number.parseFloat(buyIn),
      players: selectedPlayers,
      leagueId: activeLeague?.id,
      seasonId: activeSeason?.id,
      seriesId: activeSeries?.id,
    })

    // Navigate to the tournaments list
    router.push("/tournaments")
  }

  const breadcrumbItems = [{ label: "Tournaments", href: "/tournaments" }, { label: "Create Tournament" }]

  return (
    <AppLayout title="Create Tournament" breadcrumbs={<Breadcrumb items={breadcrumbItems} />}>
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-medium mb-4">Tournament Details</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="tournament-name" className="material-label">
                  Tournament Name
                </label>
                <input
                  id="tournament-name"
                  type="text"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  className="material-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="material-label flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="material-input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="start-time" className="material-label flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Start Time
                  </label>
                  <input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="material-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="material-label flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="material-input"
                  placeholder="e.g., Poker Club, 123 Main St"
                />
              </div>

              <div>
                <label htmlFor="buy-in" className="material-label flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Buy-in Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                  <input
                    id="buy-in"
                    type="number"
                    min="0"
                    step="0.01"
                    value={buyIn}
                    onChange={(e) => setBuyIn(e.target.value)}
                    className="material-input pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-medium mb-4">Player Roster</h2>
            <p className="text-muted-foreground mb-4">
              Add players to the tournament. You can reorder them by dragging to set their final positions.
            </p>

            <div className="space-y-4">
              <PlayerAutoSuggest
                onSelect={handleAddPlayer}
                existingPlayers={MOCK_PLAYERS}
                placeholder="Search players or enter a new player name"
              />

              <DraggablePlayerList players={selectedPlayers} onPlayersChange={setSelectedPlayers} />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => router.back()} className="material-button-secondary">
              Cancel
            </button>
            <button type="submit" className="material-button-primary flex items-center gap-2" disabled={isSubmitting}>
              <Trophy className="h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Tournament"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
