import { AppLayout } from "@/components/layout/app-layout"
import { Users, Search, Filter } from "lucide-react"
import Link from "next/link"

export default function PlayersPage() {
  return (
    <AppLayout title="Players">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">Players</h1>
          <p className="text-muted-foreground">View and manage player profiles</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="search" placeholder="Search players..." className="material-input pl-10" />
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
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div>
                      <p className="font-medium">Player {String.fromCharCode(65 + i)}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined{" "}
                        {new Date(
                          2023,
                          Math.floor(Math.random() * 12),
                          Math.floor(Math.random() * 28) + 1,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </td>
                <td>{Math.floor(Math.random() * 20) + 5}</td>
                <td>
                  {i === 0 ? "1st Place" : i === 1 ? "2nd Place" : `${Math.floor(Math.random() * 8) + 3}th Place`}
                </td>
                <td>{Math.floor(Math.random() * 500) + 100}</td>
                <td>
                  <span
                    className={`material-chip ${i < 5 ? "bg-primary-50 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    {i < 5 ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <Link href={`/players/${i + 1}`}>
                    <button className="material-button-secondary text-sm py-1">View Profile</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center mt-6">
          <div className="flex">
            <button className="px-3 py-1 border border-gray-200 rounded-l-md bg-primary text-primary-foreground">
              1
            </button>
            <button className="px-3 py-1 border-t border-b border-gray-200">2</button>
            <button className="px-3 py-1 border-t border-b border-gray-200">3</button>
            <button className="px-3 py-1 border border-gray-200 rounded-r-md">Next</button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
