import { AppLayout } from "@/components/layout/app-layout"
import { Trophy, Plus, Calendar } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { FloatingActionButton } from "@/components/ui/floating-action-button"

// Mock data for tournament results
const TOURNAMENT_RESULTS = [
  {
    id: "1",
    seriesName: "Summer Series",
    gameTime: new Date(2024, 4, 15, 19, 30),
    totalPlayers: 24,
    winner: "John Smith",
  },
  {
    id: "2",
    seriesName: "Beginner Series",
    gameTime: new Date(2024, 4, 8, 18, 0),
    totalPlayers: 16,
    winner: "Emma Johnson",
  },
  {
    id: "3",
    seriesName: "Advanced Series",
    gameTime: new Date(2024, 4, 1, 19, 0),
    totalPlayers: 32,
    winner: "Michael Brown",
  },
  {
    id: "4",
    seriesName: "Weekly Series",
    gameTime: new Date(2024, 3, 24, 18, 30),
    totalPlayers: 20,
    winner: "Olivia Davis",
  },
  {
    id: "5",
    seriesName: "Summer Series",
    gameTime: new Date(2024, 3, 17, 19, 0),
    totalPlayers: 28,
    winner: "William Wilson",
  },
]

export default function TournamentsPage() {
  return (
    <AppLayout title="Tournament Results">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOURNAMENT_RESULTS.map((tournament) => (
          <Link href={`/results/${tournament.id}`} key={tournament.id}>
            <div className="material-card h-full hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{tournament.seriesName}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {formatDate(tournament.gameTime)}
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
      <FloatingActionButton />
    </AppLayout>
  )
}
