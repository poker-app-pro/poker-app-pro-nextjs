import { AppLayout } from "@/components/layout/app-layout"
import { ChevronRight, Plus, Search } from "lucide-react"
import Link from "next/link"

export default async function TournamentRosterPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const tournamentId = params.id

  return (
    <AppLayout title="Tournament Roster">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/tournaments">
          <button className="material-button-secondary text-sm py-1">Tournaments</button>
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <Link href={`/tournaments/${tournamentId}`}>
          <button className="material-button-secondary text-sm py-1">Tournament #{tournamentId}</button>
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <h1 className="text-2xl font-medium">Roster Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="material-card">
            <div className="material-card-header">
              <h2 className="material-card-title">Current Roster</h2>
              <p className="material-card-subtitle">Players registered for this tournament</p>
            </div>
            <div className="material-card-content">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="search" placeholder="Search roster..." className="material-input pl-10" />
                </div>
              </div>

              <table className="material-data-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Registration Date</th>
                    <th>Previous Tournaments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary">
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span>Player {String.fromCharCode(65 + i)}</span>
                        </div>
                      </td>
                      <td>{new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000).toLocaleDateString()}</td>
                      <td>{Math.floor(Math.random() * 10) + 2}</td>
                      <td>
                        <div className="flex gap-2">
                          <Link href={`/players/${i + 1}`}>
                            <button className="material-button-secondary text-sm py-1">Profile</button>
                          </Link>
                          <button className="material-button-secondary text-sm py-1 text-destructive">Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="material-card">
            <div className="material-card-header">
              <h2 className="material-card-title">Add Player</h2>
              <p className="material-card-subtitle">Register a new player for this tournament</p>
            </div>
            <div className="material-card-content">
              <form>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="player-name" className="material-label">
                      Player Name
                    </label>
                    <div className="relative">
                      <input
                        id="player-name"
                        type="text"
                        className="material-input"
                        placeholder="Start typing to search..."
                      />
                      <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden">
                        <div className="p-2 hover:bg-secondary cursor-pointer">Player John</div>
                        <div className="p-2 hover:bg-secondary cursor-pointer">Player Jane</div>
                        <div className="p-2 hover:bg-secondary cursor-pointer">Player Mike</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Type to search existing players or add a new one
                    </p>
                  </div>

                  <div>
                    <label htmlFor="player-email" className="material-label">
                      Email (Optional)
                    </label>
                    <input id="player-email" type="email" className="material-input" placeholder="player@example.com" />
                  </div>

                  <div>
                    <label htmlFor="player-phone" className="material-label">
                      Phone (Optional)
                    </label>
                    <input id="player-phone" type="tel" className="material-input" placeholder="(123) 456-7890" />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="new-player"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-200 text-primary focus:ring-primary"
                    />
                    <label htmlFor="new-player" className="ml-2 text-sm text-foreground">
                      This is a new player
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="material-button-primary w-full flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Roster
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="material-card mt-6">
            <div className="material-card-header">
              <h2 className="material-card-title">Roster Summary</h2>
            </div>
            <div className="material-card-content">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Registered Players:</span>
                  <span className="text-sm font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Maximum Capacity:</span>
                  <span className="text-sm font-medium">32</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Spots Available:</span>
                  <span className="text-sm font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Registration Deadline:</span>
                  <span className="text-sm font-medium">
                    {new Date(Date.now() + 7 * 86400000).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "25%" }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Roster is 25% full</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
