"use client"

import { useState, useEffect } from "react"
import { Star, Plus, ChevronRight, Search } from "lucide-react"
import Link from "next/link"
import { getSeasons, getSeries, getTournamentsBySeries } from "@/app/__actions/series"

export default function SeriesContent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ , setSeriesList] = useState<any[]>([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [seasons, setSeasons] = useState<any[]>([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [seriesWithTournaments, setSeriesWithTournaments] = useState<any[]>([])
  const [selectedSeason, setSelectedSeason] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [seasonMap, setSeasonMap] = useState<Map<string, string>>(new Map())

  // Fetch series and seasons data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch series and seasons
        const seriesResult = await getSeries()
        const seasonsResult = await getSeasons()

        if (seriesResult.success && seasonsResult.success) {
          setSeriesList(seriesResult.data?.series || [])
          setSeasons(seasonsResult.data || [])

          // Create season map for lookup
          const newSeasonMap = new Map()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          seasonsResult?.data?.forEach((season: any) => {
            newSeasonMap.set(season.id, season.name)
          })
          setSeasonMap(newSeasonMap)

          // Process series with tournaments
          await processSeriesWithTournaments(seriesResult.data?.series || [])
        } else {
          setError(seriesResult.error || seasonsResult.error || "Failed to fetch data")
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Process series with tournaments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function processSeriesWithTournaments(seriesList: any[]) {
    try {
      const processed = await Promise.all(
        seriesList.map(async (series) => {
          const { data: tournaments = [] } = await getTournamentsBySeries(series.id)

          // Count completed tournaments
          const completedTournaments = tournaments.filter(
            (tournament) => tournament.status === "COMPLETED" || tournament.isFinalized,
          ).length

          // Calculate progress
          const progress = tournaments.length > 0 ? Math.floor((completedTournaments / tournaments.length) * 100) : 0

          // Determine status
          let status = "Upcoming"
          if (series.isActive) {
            if (tournaments.length > 0 && completedTournaments > 0) {
              status = "Active"
            }
          } else {
            if (tournaments.length === completedTournaments && tournaments.length > 0) {
              status = "Completed"
            }
          }

          return {
            ...series,
            tournaments,
            completedTournaments,
            progress,
            status,
          }
        }),
      )

      setSeriesWithTournaments(processed)
    } catch (err) {
      console.error("Error processing series with tournaments:", err)
      setError("Failed to process series data")
    }
  }

  // Filter series based on selected season and search term
  const filteredSeries = seriesWithTournaments.filter((series) => {
    // Filter by season if selected
    if (selectedSeason && series.seasonId !== selectedSeason) {
      return false
    }

    // Filter by search term if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const seriesName = series.name.toLowerCase()
      const seasonName = (seasonMap.get(series.seasonId) || "").toLowerCase()

      return seriesName.includes(searchLower) || seasonName.includes(searchLower)
    }

    return true
  })

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">Series</h1>
          <p className="text-muted-foreground">Create and manage series within seasons</p>
        </div>
        <Link href="/series/create">
          <button className="material-button-primary bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Series
          </button>
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search series..."
            className="material-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="material-input max-w-xs"
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
        >
          <option value="">All Seasons</option>
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md mb-6">Error loading series: {error}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSeries.length > 0 ? (
            filteredSeries.map((series) => {
              const seasonName = seasonMap.get(series.seasonId) || "Unknown Season"
              const totalTournaments = series.tournaments.length
              const completedTournaments = series.completedTournaments
              const isActive = series.status === "Active"
              const isUpcoming = series.status === "Upcoming"

              return (
                <div key={series.id} className="material-card">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{series.name}</h3>
                      <p className="text-sm text-muted-foreground">{seasonName}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className="text-sm">{series.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tournaments:</span>
                      <span className="text-sm">
                        {isUpcoming
                          ? `0/${totalTournaments} scheduled`
                          : `${completedTournaments}/${totalTournaments} completed`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Start Date:</span>
                      <span className="text-sm">{new Date(series.startDate).toLocaleDateString()}</span>
                    </div>
                    {series.endDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">End Date:</span>
                        <span className="text-sm">{new Date(series.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {isActive && totalTournaments > 0 && (
                    <div className="mb-4">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${series.progress}%` }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Series progress: {series.progress}%</p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span
                      className={`material-chip ${
                        isActive
                          ? "bg-primary-50 text-primary"
                          : isUpcoming
                            ? "bg-accent text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {series.status}
                    </span>
                    <Link href={`/series/${series.id}`}>
                      <button className="material-button-secondary text-sm py-1 flex items-center gap-1">
                        Manage
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full text-center p-8 text-muted-foreground">
              {searchTerm || selectedSeason
                ? "No series match your filters. Try adjusting your search criteria."
                : "No series found. Create your first series to get started."}
            </div>
          )}

          <div className="material-card border-dashed flex flex-col items-center justify-center p-6">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Create a new series</p>
            <Link href="/series/create">
              <button className="material-button-primary">New Series</button>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
