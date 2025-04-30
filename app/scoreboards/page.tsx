import { AppLayout } from "@/components/layout/app-layout"
import { BarChart2, Search } from "lucide-react"
import Link from "next/link"

export default function ScoreboardsPage() {
  return (
    <AppLayout title="Scoreboards">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">Series Scoreboards</h1>
          <p className="text-muted-foreground">View and manage series-specific scoreboards</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="search" placeholder="Search series..." className="material-input pl-10" />
        </div>
        <select className="material-input max-w-xs">
          <option value="">All Seasons</option>
          <option value="1">Spring Season 2023</option>
          <option value="2">Summer Season 2023</option>
          <option value="3">Fall Season 2023</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="material-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">
                  {i % 2 === 0 ? "Beginner" : "Advanced"} Series {i <= 2 ? "- Summer 2023" : "- Spring 2023"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {i <= 2 ? "4 tournaments" : "6 tournaments"} | {i <= 2 ? "In progress" : "Completed"}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="material-data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Points</th>
                    <th>Tournaments</th>
                    <th>Best Finish</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <tr key={j}>
                      <td className="font-medium">{j + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary">
                            {String.fromCharCode(65 + j)}
                          </div>
                          <span>Player {String.fromCharCode(65 + j)}</span>
                        </div>
                      </td>
                      <td>{Math.floor(Math.random() * 300) + 200}</td>
                      <td>{Math.floor(Math.random() * 3) + 2}</td>
                      <td>
                        {j === 0 ? (
                          <span className="material-chip bg-primary-50 text-primary">1st Place</span>
                        ) : j === 1 ? (
                          <span className="material-chip bg-accent text-primary">2nd Place</span>
                        ) : (
                          <span className="material-chip">{j + 1}th Place</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="material-card-actions">
              <Link href={`/scoreboards/${i}`}>
                <button className="material-button-secondary text-sm">View Full Scoreboard</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
