import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { Trophy, Plus, Calendar } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils" 
import { Suspense } from "react"
import { getTournamentResults } from "../../__actions/results"

export default function ResultsPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">Tournament Results</h1>
          <p className="text-muted-foreground">View and record tournament results</p>
        </div>
        <Link href="/results/create">
          <button className="material-button-primary text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Record Results
          </button>
        </Link>
      </div>

      <Suspense fallback={<ResultsLoading />}>
        <ResultsContent />
      </Suspense>

      <FloatingActionButton />
    </>
  )
}

async function ResultsContent() {
  const tournaments = await getTournamentResults()

  if (tournaments.length === 0) {
    return (
      <div className="material-card p-6 text-center">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Results Found</h3>
        <p className="text-muted-foreground mb-4">No tournament results have been recorded yet.</p>
        <Link href="/results/create">
          <button className="material-button-primary">Record Your First Result</button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tournaments.map((tournament) => (
        <Link href={`/results/${tournament.id}`} key={tournament.id}>
          <div className="material-card h-full hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{tournament.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {formatDate(new Date(tournament.gameTime))}
                </div>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span>Players: {tournament.totalPlayers}</span>
              <span className="font-medium">Winner: {tournament.winner}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function ResultsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="material-card h-full animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
