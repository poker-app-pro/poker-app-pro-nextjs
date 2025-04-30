import { AppLayout } from "@/components/layout/app-layout"
import { Trophy, Calendar, BarChart2, Medal, ChevronRight } from "lucide-react"
import Link from "next/link"

export default async function PlayerProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const playerId = params.id
  const playerName = `Player ${String.fromCharCode(64 + Number.parseInt(playerId))}`

  return (
    <AppLayout title={`Player Profile: ${playerName}`}>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/players">
          <button className="material-button-secondary text-sm py-1">Players</button>
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <h1 className="text-2xl font-medium">{playerName}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="material-card">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Tournaments</p>
              <p className="text-2xl font-medium">{Math.floor(Math.random() * 30) + 10}</p>
            </div>
          </div>
        </div>

        <div className="material-card">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Medal className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Tournament Wins</p>
              <p className="text-2xl font-medium">{Math.floor(Math.random() * 5) + 1}</p>
            </div>
          </div>
        </div>

        <div className="material-card">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Points</p>
              <p className="text-2xl font-medium">{Math.floor(Math.random() * 1000) + 500}</p>
            </div>
          </div>
        </div>

        <div className="material-card">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Last Tournament</p>
              <p className="text-2xl font-medium">
                {new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="material-card">
          <div className="material-card-header">
            <h2 className="material-card-title">Tournament History</h2>
            <p className="material-card-subtitle">All tournaments this player has participated in</p>
          </div>
          <div className="material-card-content">
            <table className="material-data-table">
              <thead>
                <tr>
                  <th>Tournament</th>
                  <th>Date</th>
                  <th>Finish</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="font-medium">
                      {i % 2 === 0 ? "Summer Series" : "Spring Series"} Tournament #{Math.floor(i / 2) + 1}
                    </td>
                    <td>{new Date(2024 - Math.floor(i / 4), i % 12, 15).toLocaleDateString()}</td>
                    <td>
                      {i === 0 ? (
                        <span className="material-chip bg-primary/10 text-primary">1st Place</span>
                      ) : i === 1 ? (
                        <span className="material-chip bg-accent text-primary">2nd Place</span>
                      ) : (
                        <span className="material-chip">{Math.floor(Math.random() * 10) + 3}th Place</span>
                      )}
                    </td>
                    <td>{Math.floor(Math.random() * 100) + 50}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="material-card">
          <div className="material-card-header">
            <h2 className="material-card-title">Performance Statistics</h2>
            <p className="material-card-subtitle">Player performance across all tournaments</p>
          </div>
          <div className="material-card-content">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Average Finish</span>
                  <span className="text-sm">{Math.floor(Math.random() * 5) + 3}th place</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Top 3 Finishes</span>
                  <span className="text-sm">{Math.floor(Math.random() * 5) + 2}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Win Rate</span>
                  <span className="text-sm">{Math.floor(Math.random() * 20) + 10}%</span>
                </div>
              </div>

              <div className="material-divider"></div>

              <div>
                <h3 className="text-sm font-medium mb-3">Game Type Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Texas Hold&apos;em</span>
                      <span className="text-sm">{Math.floor(Math.random() * 30) + 70}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Omaha</span>
                      <span className="text-sm">{Math.floor(Math.random() * 30) + 40}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.floor(Math.random() * 30) + 40}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Seven Card Stud</span>
                      <span className="text-sm">{Math.floor(Math.random() * 30) + 30}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.floor(Math.random() * 30) + 30}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
