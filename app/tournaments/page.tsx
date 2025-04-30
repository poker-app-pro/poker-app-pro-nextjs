import { AppLayout } from "@/components/layout/app-layout"
import { Trophy, Plus, Search, Filter } from "lucide-react"
import Link from "next/link"

export default function TournamentsPage() {
  return (
    <AppLayout title="Tournaments">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">Tournaments</h1>
          <p className="text-muted-foreground">Create and manage tournaments within series</p>
        </div>
        <Link href="/tournaments/create">
          <button className="material-button-primary bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Tournament
          </button>
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="search" placeholder="Search tournaments..." className="material-input pl-10" />
        </div>
        <button className="material-button-secondary flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="material-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-medium">Upcoming Tournaments</h2>
        </div>

        <table className="material-data-table">
          <thead>
            <tr>
              <th>Tournament Name</th>
              <th>Series</th>
              <th>Date</th>
              <th>Players</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i}>
                <td className="font-medium">Summer Series Tournament #{i}</td>
                <td>Summer Series</td>
                <td>{new Date(Date.now() + i * 86400000 * 3).toLocaleDateString()}</td>
                <td>{Math.floor(Math.random() * 20) + 20} registered</td>
                <td>
                  <span className="material-chip bg-accent text-primary">Upcoming</span>
                </td>
                <td>
                  <Link href={`/tournaments/${i}`}>
                    <button className="material-button-secondary text-sm py-1">Manage</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="material-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-medium">Recent Tournaments</h2>
        </div>

        <table className="material-data-table">
          <thead>
            <tr>
              <th>Tournament Name</th>
              <th>Series</th>
              <th>Date</th>
              <th>Winner</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="font-medium">Spring Series Tournament #{i}</td>
                <td>Spring Series</td>
                <td>{new Date(Date.now() - i * 86400000 * 5).toLocaleDateString()}</td>
                <td>Player {String.fromCharCode(64 + i)}</td>
                <td>
                  <span className="material-chip bg-muted text-muted-foreground">Completed</span>
                </td>
                <td>
                  <Link href={`/tournaments/${i + 10}`}>
                    <button className="material-button-secondary text-sm py-1">View Results</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  )
}
