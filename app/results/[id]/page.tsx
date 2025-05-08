import { AppLayout } from "@/components/layout/app-layout"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Trophy, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

// Mock data for a tournament result
const TOURNAMENT_RESULT = {
  id: "1",
  seriesName: "Summer Series",
  gameTime: new Date(2024, 4, 15, 19, 30),
  totalPlayers: 24,
  rankings: [
    { id: "1", name: "John Smith", position: 1, points: 100 },
    { id: "2", name: "Emma Johnson", position: 2, points: 90 },
    { id: "3", name: "Michael Brown", position: 3, points: 80 },
    { id: "4", name: "Olivia Davis", position: 4, points: 70 },
    { id: "5", name: "William Wilson", position: 5, points: 60 },
    { id: "6", name: "Sophia Martinez", position: 6, points: 50 },
    { id: "7", name: "James Anderson", position: 7, points: 40 },
    { id: "8", name: "Charlotte Taylor", position: 8, points: 30 },
  ],
  bounties: [
    { id: "3", name: "Michael Brown", target: "John Smith", points: 20 },
    { id: "5", name: "William Wilson", target: "Emma Johnson", points: 20 },
  ],
  consolation: [
    { id: "9", name: "Benjamin Thomas", points: 15 },
    { id: "10", name: "Amelia Harris", points: 15 },
    { id: "11", name: "Lucas Clark", points: 15 },
  ],
}

export default function TournamentDetailsPage( ) {
   const tournament = TOURNAMENT_RESULT // In a real app, fetch by ID

  const breadcrumbItems = [
    { label: "Tournaments", href: "/results" },
    { label: `${tournament.seriesName} - ${formatDate(tournament.gameTime)}` },
  ]

  return (
    <AppLayout title="Tournament Results" breadcrumbs={<Breadcrumb items={breadcrumbItems} />}>
      <div className="max-w-4xl mx-auto">
        <div className="material-card mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-medium">{tournament.seriesName}</h2>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(tournament.gameTime)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-secondary p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Total Players</h3>
              </div>
              <p className="text-2xl font-medium">{tournament.totalPlayers}</p>
            </div>
            <div className="bg-secondary p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Winner</h3>
              </div>
              <p className="text-2xl font-medium">{tournament.rankings[0]?.name || "N/A"}</p>
            </div>
            <div className="bg-secondary p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Game Time</h3>
              </div>
              <p className="text-2xl font-medium">
                {tournament.gameTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Player Rankings</h3>
            <div className="overflow-x-auto">
              <table className="material-data-table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Player</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {tournament.rankings.map((player) => (
                    <tr key={player.id}>
                      <td className="w-16 text-center">{player.position}</td>
                      <td>
                        <Link href={`/players/${player.id}`} className="hover:text-primary">
                          {player.name}
                        </Link>
                      </td>
                      <td className="w-24 text-right font-medium">{player.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {tournament.bounties.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Bounties</h3>
              <div className="overflow-x-auto">
                <table className="material-data-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Target</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournament.bounties.map((bounty) => (
                      <tr key={bounty.id}>
                        <td>
                          <Link href={`/players/${bounty.id}`} className="hover:text-primary">
                            {bounty.name}
                          </Link>
                        </td>
                        <td>{bounty.target}</td>
                        <td className="w-24 text-right font-medium">{bounty.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tournament.consolation.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Consolation Games</h3>
              <div className="overflow-x-auto">
                <table className="material-data-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournament.consolation.map((player) => (
                      <tr key={player.id}>
                        <td>
                          <Link href={`/players/${player.id}`} className="hover:text-primary">
                            {player.name}
                          </Link>
                        </td>
                        <td className="w-24 text-right font-medium">{player.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
