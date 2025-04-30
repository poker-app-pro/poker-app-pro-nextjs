import { AppLayout } from "@/components/layout/app-layout"
import { Search, Trophy } from "lucide-react"

export default function QualificationPage() {
  return (
    <AppLayout title="Main Event Qualification">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">Main Event Qualification</h1>
          <p className="text-muted-foreground">Track players who qualify for the season finale</p>
        </div>
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
            <h3 className="font-medium text-lg">Summer Season 2023 - Main Event</h3>
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
                <span className="text-sm">Series Winners:</span>
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

        <div className="overflow-x-auto">
          <table className="material-data-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Qualification Method</th>
                <th>Series</th>
                <th>Total Points</th>
                <th>Tournaments</th>
                <th>Status</th>
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
                  <td>
                    {i < 3 ? (
                      <span className="material-chip bg-primary-50 text-primary">Tournament Winner</span>
                    ) : i < 8 ? (
                      <span className="material-chip bg-accent text-primary">Top 10 Finish</span>
                    ) : (
                      <span className="material-chip">Season Points</span>
                    )}
                  </td>
                  <td>{i % 2 === 0 ? "Beginner Series" : "Advanced Series"}</td>
                  <td>{Math.floor(Math.random() * 500) + 300}</td>
                  <td>{Math.floor(Math.random() * 4) + 3}</td>
                  <td>
                    <span className="material-chip bg-primary-50 text-primary">Qualified</span>
                  </td>
                </tr>
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i + 10}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        {String.fromCharCode(75 + i)}
                      </div>
                      <span>Player {String.fromCharCode(75 + i)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="material-chip bg-muted text-muted-foreground">Pending</span>
                  </td>
                  <td>{i % 2 === 0 ? "Beginner Series" : "Advanced Series"}</td>
                  <td>{Math.floor(Math.random() * 300) + 200}</td>
                  <td>{Math.floor(Math.random() * 3) + 1}</td>
                  <td>
                    <span className="material-chip bg-accent text-primary">On Waitlist</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
