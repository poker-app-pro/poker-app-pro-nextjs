"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Trophy, Calendar, Users, BarChart2, Loader2 } from "lucide-react"
import Link from "next/link"
import {
  getActiveSeasons,
  getQualifiedPlayers,
  getQualificationStatus,
  getPreviousSeasonEvents,
  type QualifiedPlayer,
  type QualificationStatus,
  type SeasonEvent,
} from "@/app/__actions/qualification"

export default function SeasonEventPage() {
  // State for data
  const [seasons, setSeasons] = useState<{ id: string; name: string }[]>([])
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("")
  const [qualifiedPlayers, setQualifiedPlayers] = useState<QualifiedPlayer[]>([])
  const [qualificationStatus, setQualificationStatus] = useState<QualificationStatus | null>(null)
  const [previousEvents, setPreviousEvents] = useState<SeasonEvent[]>([])

  // State for UI
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Load seasons on mount
  useEffect(() => {
    async function loadSeasons() {
      try {
        const result = await getActiveSeasons()
        if (result.success && (result?.data?.length as number) > 0) {
          if(result.data) {
            setSeasons(result.data)
            setSelectedSeasonId(result.data[0].id) // Select first season by default
          }
        } else {
          setError("No active seasons found")
        }
      } catch (err) {
        console.error("Error loading seasons:", err)
        setError("Failed to load seasons")
      } finally {
        setLoading(false)
      }
    }

    loadSeasons()
  }, [])

  // Load data when season changes
  useEffect(() => {
    if (!selectedSeasonId) return

    async function loadData() {
      setLoading(true)
      try {
        // Load qualified players
        const playersResult = await getQualifiedPlayers(selectedSeasonId, searchQuery)
        if (playersResult.success && playersResult.data) {
          setQualifiedPlayers(playersResult.data)
        }

        // Load qualification status
        const statusResult = await getQualificationStatus(selectedSeasonId)
        if (statusResult.success && statusResult.data) {
          setQualificationStatus(statusResult.data)
        }

        // Load previous events
        const eventsResult = await getPreviousSeasonEvents(selectedSeasonId)
        if (eventsResult.success && eventsResult.data) {
          setPreviousEvents(eventsResult.data)
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load qualification data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedSeasonId, searchQuery])

  // Handle season change
  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeasonId(e.target.value)
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get player initial
  const getPlayerInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  // Get current season name
  const getCurrentSeasonName = () => {
    const season = seasons.find((s) => s.id === selectedSeasonId)
    return season ? season.name : "Current Season"
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">Season Event</h1>
          <p className="text-muted-foreground">Track players who qualify for the season finale</p>
        </div>
        <Link href="/qualification/record">
          <button className="material-button-primary text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Record Results
          </button>
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search players..."
            className="material-input pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <select
          className="material-input max-w-xs"
          value={selectedSeasonId}
          onChange={handleSeasonChange}
          disabled={loading || seasons.length === 0}
        >
          {seasons.length === 0 ? (
            <option value="">No seasons available</option>
          ) : (
            seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))
          )}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="material-card p-6 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      ) : (
        <>
          <div className="material-card mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">{getCurrentSeasonName()} - Season Event</h3>
                <p className="text-sm text-muted-foreground">
                  {qualificationStatus
                    ? `Qualified Players: ${qualificationStatus.totalQualified}/${qualificationStatus.maxPlayers}`
                    : "Qualification in progress"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-secondary p-4 rounded">
                <h3 className="font-medium mb-2">Qualification Criteria</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Top 10 players from each series automatically qualify</li>
                  <li>Players must have participated in at least 3 tournaments</li>
                  <li>Players with tournament wins receive priority</li>
                  <li>Remaining spots filled based on total season points</li>
                </ul>
              </div>
              {qualificationStatus && (
                <div className="bg-secondary p-4 rounded">
                  <h3 className="font-medium mb-2">Qualification Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Qualified Players:</span>
                      <span className="text-sm font-medium">
                        {qualificationStatus.totalQualified}/{qualificationStatus.maxPlayers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tournament Winners:</span>
                      <span className="text-sm font-medium">{qualificationStatus.tournamentWinners}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Top 10 Qualifiers:</span>
                      <span className="text-sm font-medium">{qualificationStatus.topQualifiers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Remaining Spots:</span>
                      <span className="text-sm font-medium">{qualificationStatus.remainingSpots}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <h3 className="font-medium mb-3">Qualified Players</h3>
            <div className="overflow-x-auto">
              {qualifiedPlayers.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  {searchQuery ? "No players match your search" : "No qualified players yet"}
                </p>
              ) : (
                <table className="material-data-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Tournaments</th>
                      <th>Total Chips</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualifiedPlayers.map((player) => (
                      <tr key={player.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary">
                              {getPlayerInitial(player.name)}
                            </div>
                            <span>{player.name}</span>
                          </div>
                        </td>
                        <td>{player.tournamentCount}</td>
                        <td>{player.totalChips.toLocaleString()}</td>
                        <td>
                          <Link href={`/players/${player.id}`}>
                            <button className="material-button-secondary text-sm py-1">View Profile</button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {previousEvents.length > 0 && (
            <div className="material-card">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Previous Season Events</h3>
                  <p className="text-sm text-muted-foreground">Historical results from past season finales</p>
                </div>
              </div>

              <div className="space-y-6">
                {previousEvents.map((event) => (
                  <div key={event.id} className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {event.name}
                      </h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{event.playerCount} players</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="material-data-table">
                        <thead>
                          <tr>
                            <th>Position</th>
                            <th>Player</th>
                            <th>Starting Chips</th>
                            <th>Prize</th>
                          </tr>
                        </thead>
                        <tbody>
                          {event.results.map((result) => (
                            <tr key={`${event.id}-${result.playerId}`}>
                              <td className="w-16 text-center">{result.position}</td>
                              <td>
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary">
                                    {getPlayerInitial(result.playerName)}
                                  </div>
                                  <Link href={`/players/${result.playerId}`} className="hover:text-primary">
                                    {result.playerName}
                                  </Link>
                                </div>
                              </td>
                              <td>{result.startingChips.toLocaleString()}</td>
                              <td>{formatCurrency(result.prize)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-2 text-right">
                      <Link href={`/qualification/history/${event.id}`}>
                        <button className="material-button-secondary text-sm">View Full Results</button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
