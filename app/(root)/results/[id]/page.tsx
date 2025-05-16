import { Trophy, Calendar, MapPin, Users, DollarSign, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"
import { getTournamentResultDetails } from "@/app/__actions/results"

export default async function TournamentResultDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let tournament

  try {
    tournament = await getTournamentResultDetails(id)
  } catch (error) {
    console.error("Error fetching tournament details:", error)
    notFound()
  }

  if (!tournament) {
    notFound()
  }

  return (
    <>
      <Link href="/results" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Results
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-medium">{tournament.name}</h1>
          <p className="text-muted-foreground">
            {tournament.seriesName} | {tournament.seasonName}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="material-chip bg-primary-50 text-primary flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            {formatDate(new Date(tournament.gameTime))}
          </div>
          {tournament.location && (
            <div className="material-chip bg-secondary text-secondary-foreground flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              {tournament.location}
            </div>
          )}
          <div className="material-chip bg-secondary text-secondary-foreground flex items-center">
            <Users className="h-3.5 w-3.5 mr-1" />
            {tournament.totalPlayers} Players
          </div>
          {tournament.prizePool > 0 && (
            <div className="material-chip bg-green-50 text-green-700 flex items-center">
              <DollarSign className="h-3.5 w-3.5 mr-1" />${tournament.prizePool.toFixed(2)} Prize Pool
            </div>
          )}
        </div>
      </div>

      <div className="material-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-medium">Final Results</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="material-data-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Player</th>
                <th>Points</th>
                <th>Special</th>
              </tr>
            </thead>
            <tbody>
              {tournament.results.map((result) => (
                <tr key={result.id} className={result.position === 1 ? "bg-primary-50" : ""}>
                  <td className="text-center font-medium">
                    {result.position === 1 ? (
                      <div className="flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-primary mr-1" />
                        1st
                      </div>
                    ) : (
                      `${result.position}${getOrdinalSuffix(result?.position as number)}`
                    )}
                  </td>
                  <td>
                    <Link href={`/players/${result.playerId}`} className="hover:text-primary">
                      {result.playerName}
                    </Link>
                  </td>
                  <td className="text-right font-medium">{result.points}</td>
                  <td>
                    {result.bountyCount > 0 && (
                      <span className="material-chip bg-amber-50 text-amber-700 mr-1">
                        {result.bountyCount > 1 ? `Bounty x${result.bountyCount}` : "Bounty"}
                      </span>
                    )}
                    {result.isConsolation && (
                      <span className="material-chip bg-purple-50 text-purple-700">Consolation</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="material-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-medium">Tournament Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournament.buyIn > 0 && (
            <div>
              <h3 className="font-medium mb-2">Buy-in Structure</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Initial Buy-in:</span>
                  <span className="font-medium">${tournament.buyIn.toFixed(2)}</span>
                </li>
                {tournament.prizePool > 0 && (
                  <li className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                    <span className="font-medium">Total Prize Pool:</span>
                    <span className="font-medium text-green-700">${tournament.prizePool.toFixed(2)}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Tournament Information</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-muted-foreground">League:</span>
                <span className="font-medium">{tournament.leagueName}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Season:</span>
                <span className="font-medium">{tournament.seasonName}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Series:</span>
                <span className="font-medium">{tournament.seriesName}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{formatDate(new Date(tournament.gameTime))}</span>
              </li>
              {tournament.location && (
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{tournament.location}</span>
                </li>
              )}
              <li className="flex justify-between">
                <span className="text-muted-foreground">Total Players:</span>
                <span className="font-medium">{tournament.totalPlayers}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10
  const k = num % 100
  if (j === 1 && k !== 11) {
    return "st"
  }
  if (j === 2 && k !== 12) {
    return "nd"
  }
  if (j === 3 && k !== 13) {
    return "rd"
  }
  return "th"
}
