 
import { BarChart2, Trophy } from "lucide-react"
import Link from "next/link"

// Mock data for seasons and standings
const MOCK_SEASONS = [
  {
    id: "1",
    name: "Summer Season 2024",
    league: "Texas Hold'em League",
    series: [
      {
        id: "1",
        name: "Summer Series",
        standings: [
          { id: "1", name: "John Smith", points: 450 },
          { id: "2", name: "Emma Johnson", points: 380 },
          { id: "3", name: "Michael Brown", points: 320 },
          { id: "4", name: "Olivia Davis", points: 290 },
          { id: "5", name: "William Wilson", points: 240 },
        ],
      },
      {
        id: "2",
        name: "Beginner Series",
        standings: [
          { id: "6", name: "Sophia Martinez", points: 410 },
          { id: "7", name: "James Anderson", points: 350 },
          { id: "8", name: "Charlotte Taylor", points: 310 },
          { id: "9", name: "Benjamin Thomas", points: 280 },
          { id: "10", name: "Amelia Harris", points: 230 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Spring Season 2024",
    league: "Omaha League",
    series: [
      {
        id: "3",
        name: "Advanced Series",
        standings: [
          { id: "11", name: "Lucas Clark", points: 520 },
          { id: "12", name: "Mia Lewis", points: 480 },
          { id: "1", name: "John Smith", points: 420 },
          { id: "2", name: "Emma Johnson", points: 380 },
          { id: "3", name: "Michael Brown", points: 340 },
        ],
      },
      {
        id: "4",
        name: "Weekly Series",
        standings: [
          { id: "4", name: "Olivia Davis", points: 390 },
          { id: "5", name: "William Wilson", points: 360 },
          { id: "6", name: "Sophia Martinez", points: 330 },
          { id: "7", name: "James Anderson", points: 300 },
          { id: "8", name: "Charlotte Taylor", points: 270 },
        ],
      },
    ],
  },
]

export default function StandingsPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">Standings</h1>
          <p className="text-muted-foreground">View current standings for all seasons and series</p>
        </div>
      </div>

      <div className="space-y-8">
        {MOCK_SEASONS.map((season) => (
          <div key={season.id} className="material-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">{season.name}</h3>
                <p className="text-sm text-muted-foreground">{season.league}</p>
              </div>
            </div>

            <div className="space-y-6">
              {season.series.map((series) => (
                <div key={series.id} className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    {series.name}
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="material-data-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Player</th>
                          <th>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {series.standings.map((player, index) => (
                          <tr key={player.id}>
                            <td className="w-16 text-center">{index + 1}</td>
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

                  <div className="mt-2 text-right">
                    <Link href={`/scoreboards/${series.id}`}>
                      <button className="material-button-secondary text-sm">View Full Standings</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
