"use client"

import { useEffect, useState } from "react"
import { Users, Search, Filter, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getPlayers, PlayerListItem } from "../../__actions/players"
 
export default function PlayersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [players, setPlayers] = useState<PlayerListItem[]>([])
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1) // Reset to first page on new search
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Fetch players when search or page changes
  useEffect(() => {
    async function fetchPlayers() {
      try {
        setLoading(true)
        const result = await getPlayers(debouncedSearch, currentPage)

        if (result.success && result.data) {
          setPlayers(result.data.players)
          setTotalPages(result.data.totalPages)
        } else {
          setError(result.error || "Failed to fetch players")
        }
      } catch (err) {
        console.error("Error fetching players:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [debouncedSearch, currentPage])

  function getOrdinal(n: number) {
    if (n === 0) return "N/A"
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">Players</h1>
          <p className="text-muted-foreground">View and manage player profiles</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search players..."
            className="material-input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="material-button-secondary flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="material-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-medium">Player Directory</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Players Found</h3>
            <p className="text-muted-foreground">
              {debouncedSearch ? `No players match "${debouncedSearch}"` : "No players have been added yet"}
            </p>
          </div>
        ) : (
          <>
            <table className="material-data-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Tournaments</th>
                  <th>Best Finish</th>
                  <th>Points</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{player.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(player.joinedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{player.tournamentCount}</td>
                    <td>{getOrdinal(player.bestFinish)}</td>
                    <td>{player.totalPoints}</td>
                    <td>
                      <span
                        className={`material-chip ${
                          player.isActive ? "bg-primary-50 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {player.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <Link href={`/players/${player.id}`}>
                        <button className="material-button-secondary text-sm py-1">View Profile</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-center mt-6">
              <div className="flex">
                <button
                  className="px-3 py-1 border border-gray-200 rounded-l-md hover:bg-muted disabled:opacity-50"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum = currentPage - 2 + i
                  if (pageNum <= 0) pageNum = i + 1
                  if (pageNum > totalPages) return null

                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-1 border-t border-b border-gray-200 ${
                        pageNum === currentPage ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  className="px-3 py-1 border border-gray-200 rounded-r-md hover:bg-muted disabled:opacity-50"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
