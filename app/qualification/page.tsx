import { AppLayout } from "@/components/layout/app-layout"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { Search, Trophy, Calendar, Users, BarChart2 } from "lucide-react"
import Link from "next/link"

export default function SeasonEventPage() {
  return (
    <AppLayout title="Season Event">
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
          <input type="search" placeholder="Search players..." className="material-input pl-10" />
        </div>
        <select className="material-input max-w-xs">
          <option value="">All Seasons</option>
          <option value="1">Spring Season 2023</option>
          <option value="2">Summer Season 2023</option>
          <option value="3">Fall Season 2023</option>
        </select>
      </div>

      <div className="material-card mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-lg">Summer Season 2023 - Season Event</h3>
            <p className="text-sm text-muted-foreground">Scheduled for August 15, 2023 | 32 player cap</p>
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
          <div className="bg-secondary p-4 rounded">
            <h3 className="font-medium mb-2">Qualification Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Qualified Players:</span>
                <span className="text-sm font-medium">24/32</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tournament Winners:</span>
                <span className="text-sm font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Top 10 Qualifiers:</span>
                <span className="text-sm font-medium">16</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Remaining Spots:</span>
                <span className="text-sm font-medium">8</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="font-medium mb-3">Qualified Players</h3>
        <div className="overflow-x-auto">
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
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span>Player {String.fromCharCode(65 + i)}</span>
                    </div>
                  </td>
                  <td>{Math.floor(Math.random() * 4) + 3}</td>
                  <td>{Math.floor(Math.random() * 50000) + 10000}</td>
                  <td>
                    <Link href={`/players/${i + 1}`}>
                      <button className="material-button-secondary text-sm py-1">View Profile</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
          {[1, 2].map((seasonId) => (
            <div key={seasonId} className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {seasonId === 1 ? "Spring Season 2023" : "Winter Season 2022"} - Season Event
                </h4>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  <span>32 players</span>
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
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="w-16 text-center">{i + 1}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary">
                              {String.fromCharCode(70 + i)}
                            </div>
                            <Link href={`/players/${i + 10}`} className="hover:text-primary">
                              Player {String.fromCharCode(70 + i)}
                            </Link>
                          </div>
                        </td>
                        <td>{Math.floor(Math.random() * 30000) + 20000}</td>
                        <td>{i === 0 ? "$1,200" : i === 1 ? "$800" : i === 2 ? "$500" : i === 3 ? "$300" : "$200"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-2 text-right">
                <Link href={`/qualification/history/${seasonId}`}>
                  <button className="material-button-secondary text-sm">View Full Results</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <FloatingActionButton />
    </AppLayout>
  )
}
