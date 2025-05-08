import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Calendar, Users, Plus, ChevronRight, Award } from "lucide-react"
import Link from "next/link"

export default async function LeagueDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: leagueId } = await params

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/leagues">
              <Button variant="ghost" size="sm">
                Leagues
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <h1 className="text-3xl font-bold tracking-tight">Texas Hold'em League {leagueId}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/leagues/${leagueId}/seasons/create`}>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              New Season
            </Button>
          </Link>
          <Link href={`/results/create?leagueId=${leagueId}`}>
            <Button>
              <Trophy className="mr-2 h-4 w-4" />
              Add Results
            </Button>
          </Link>
        </div>
      </div>

      {/* Simplified 2x2 stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seasons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Series</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Results</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="seasons">
        <TabsList>
          <TabsTrigger value="seasons">Seasons</TabsTrigger>
          <TabsTrigger value="series">Series</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
        </TabsList>
        <TabsContent value="seasons" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle>Season {i}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Start Date:</span>
                      <span className="text-sm">{new Date(2023, i * 3, 15).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className="text-sm">{i === 2 ? "Active" : "Completed"}</span>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 pt-0 flex gap-2">
                  <Link href={`/leagues/${leagueId}/seasons/${i}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Link href={`/results/create?seasonId=${i}`} className="flex-1">
                    <Button className="w-full">Add Results</Button>
                  </Link>
                </div>
              </Card>
            ))}
            <Card className="flex flex-col items-center justify-center p-6 border-dashed">
              <Plus className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-4">Create a new season</p>
              <Link href={`/leagues/${leagueId}/seasons/create`}>
                <Button>New Season</Button>
              </Link>
            </Card>
          </div>
        </TabsContent>

        {/* Other tab contents remain similar but simplified */}
      </Tabs>
    </div>
  )
}
