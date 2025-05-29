"use client"

import { useEffect, useState } from "react"
import { BarChart2, Trophy, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getStandings, StandingsData } from "@/app/__actions/standings"
 
export default function StandingsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [standingsData, setStandingsData] = useState<StandingsData | null>(null)

  useEffect(() => {
    async function fetchStandings() {
      try {
        setLoading(true)
        const result = await getStandings()

        if (result.success && result.data) {
          setStandingsData(result.data)
        } else {
          setError(result.error || "Failed to fetch standings")
        }
      } catch (err) {
        console.error("Error fetching standings:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()
  }, [])

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">Standings</h1>
          <p className="text-muted-foreground">View current standings for all seasons and series</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      ) : !standingsData || standingsData.seasons.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No Standings Available</h3>
          <p className="text-muted-foreground">
            There are no active seasons with standings data. Create tournaments to see standings.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {standingsData.seasons.map((season) => (
            <div key={season.id} className="material-card">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{season.name}</h3>
                  <p className="text-sm text-muted-foreground">{season.league.name}</p>
                </div>
              </div>

              <div className="space-y-6">
                {season.series.map((series) => (
                  <div key={series.id} className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-primary" />
                      {series.name}
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="material-data-table">
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Regular</th>
                            <th>Bounty</th>
                            <th>Consolation</th>
                            <th>Total Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {series.standings.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-4 text-muted-foreground">
                                No standings data available for this series
                              </td>
                            </tr>
                          ) : (
                            series.standings.slice(0, 5).map((player, index) => (
                              <tr key={player.id}>
                                <td className="w-16 text-center">{index + 1}</td>
                                <td>
                                  <Link href={`/players/${player.playerId}`} className="hover:text-primary">
                                    {player.playerName}
                                  </Link>
                                </td>
                                <td className="text-right">{player.regularPoints}</td>
                                <td className="text-right">{player.bountyPoints}</td>
                                <td className="text-right">{player.consolationPoints}</td>
                                <td className="w-24 text-right font-medium">{player.totalPoints}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-2 text-right">
                      {/* <Link href={`/standings/${series.id}`}>
                        <button className="material-button-secondary text-sm">View Full Standings</button>
                      </Link> */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
