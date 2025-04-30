import { AppLayout } from "@/components/layout/app-layout"
import { Star, Plus, ChevronRight, Search } from "lucide-react"
import Link from "next/link"

export default function SeriesPage() {
  return (
    <AppLayout title="Series">
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
          <input type="search" placeholder="Search series..." className="material-input pl-10" />
        </div>
        <select className="material-input max-w-xs">
          <option value="">All Seasons</option>
          <option value="1">Spring Season 2023</option>
          <option value="2">Summer Season 2023</option>
          <option value="3">Fall Season 2023</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, ].map((i) => (
          <div key={i} className="material-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">
                  {i % 3 === 0 ? "Beginner" : i % 3 === 1 ? "Intermediate" : "Advanced"} Series
                </h3>
                <p className="text-sm text-muted-foreground">
                  {i % 3 === 0 ? "Spring" : i % 3 === 1 ? "Summer" : "Fall"} Season {2023 + Math.floor(i / 3)}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="text-sm">{i < 3 ? "Active" : i < 5 ? "Upcoming" : "Completed"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tournaments:</span>
                <span className="text-sm">
                  {i < 3
                    ? `${i + 1}/${i + 3} completed`
                    : i < 5
                      ? `0/${i + 2} scheduled`
                      : `${i + 2}/${i + 2} completed`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Players:</span>
                <span className="text-sm">{Math.floor(Math.random() * 30) + 20}</span>
              </div>
            </div>

            {i < 3 && (
              <div className="mb-4">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.floor(((i + 1) / (i + 3)) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Series progress: {Math.floor(((i + 1) / (i + 3)) * 100)}%
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <span
                className={`material-chip ${i < 3 ? "bg-primary-50 text-primary" : i < 5 ? "bg-accent text-primary" : "bg-muted text-muted-foreground"}`}
              >
                {i < 3 ? "Active" : i < 5 ? "Upcoming" : "Completed"}
              </span>
              <Link href={`/series/${i}`}>
                <button className="material-button-secondary text-sm py-1 flex items-center gap-1">
                  Manage
                  <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        ))}

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
    </AppLayout>
  )
}
