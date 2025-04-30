import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Calendar,
  Users,
  Plus,
  ChevronRight,
  Award,
} from "lucide-react";
import Link from "next/link";

export default async function LeagueDetailsPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const leagueId = params.id;

  return (
    <AppLayout title="League Details">
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
              <h1 className="text-3xl font-bold tracking-tight">
                Texas Hold&apos;em League {leagueId}
              </h1>
            </div>
            <p className="text-muted-foreground">
              Season 2 (2024) - 8 tournaments planned
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/leagues/${leagueId}/seasons/create`}>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                New Season
              </Button>
            </Link>
            <Link href={`/leagues/${leagueId}/tournaments/create`}>
              <Button>
                <Trophy className="mr-2 h-4 w-4" />
                New Tournament
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Seasons
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                Current season started 3 months ago
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Series
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">2 active series</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Players
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87</div>
              <p className="text-xs text-muted-foreground">
                +12 from last season
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tournaments</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                3 completed, 5 upcoming
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="seasons">
          <TabsList>
            <TabsTrigger value="seasons">Seasons</TabsTrigger>
            <TabsTrigger value="series">Series</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
          </TabsList>
          <TabsContent value="seasons" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle>Season {i}</CardTitle>
                    <CardDescription>
                      {i === 2 ? "Current Season" : "Previous Season"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Start Date:
                        </span>
                        <span className="text-sm">
                          {new Date(2023, i * 3, 15).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          End Date:
                        </span>
                        <span className="text-sm">
                          {i === 2
                            ? "In Progress"
                            : new Date(
                                2023,
                                i * 3 + 3,
                                15
                              ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Series:
                        </span>
                        <span className="text-sm">
                          {i === 2 ? "2 active" : "2 completed"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Tournaments:
                        </span>
                        <span className="text-sm">
                          {i === 2 ? "3/8 completed" : "8/8 completed"}
                        </span>
                      </div>
                      {i === 2 && (
                        <div className="pt-2">
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: "37.5%" }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Season progress: 37.5%
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardHeader className="pt-0">
                    <Link href={`/leagues/${leagueId}/seasons/${i}`}>
                      <Button variant="outline" className="w-full">
                        View Season
                      </Button>
                    </Link>
                  </CardHeader>
                </Card>
              ))}
              <Card className="flex flex-col items-center justify-center p-6 border-dashed border-gray-200 dark:border-gray-700 ">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">
                  Create a new season
                </p>
                <Link href={`/leagues/${leagueId}/seasons/create`}>
                  <Button>New Season</Button>
                </Link>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="series" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle>
                      {i <= 2 ? `Summer Series ${i}` : `Spring Series ${i - 2}`}
                    </CardTitle>
                    <CardDescription>
                      {i <= 2 ? "Season 2" : "Season 1"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Status:
                        </span>
                        <span className="text-sm">
                          {i === 1
                            ? "Active"
                            : i === 2
                            ? "Upcoming"
                            : "Completed"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Tournaments:
                        </span>
                        <span className="text-sm">
                          {i === 1
                            ? "2/4 completed"
                            : i === 2
                            ? "0/4 scheduled"
                            : "4/4 completed"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Players:
                        </span>
                        <span className="text-sm">
                          {Math.floor(Math.random() * 30) + 20}
                        </span>
                      </div>
                      {i === 1 && (
                        <div className="pt-2">
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: "50%" }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Series progress: 50%
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardHeader className="pt-0">
                    <Link href={`/leagues/${leagueId}/series/${i}`}>
                      <Button variant="outline" className="w-full">
                        View Series
                      </Button>
                    </Link>
                  </CardHeader>
                </Card>
              ))}
              <Card className="flex flex-col items-center justify-center p-6 border-dashed border-gray-200 dark:border-gray-700 ">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">
                  Create a new series
                </p>
                <Link href={`/leagues/${leagueId}/series/create`}>
                  <Button>New Series</Button>
                </Link>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="tournaments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tournaments</CardTitle>
                <CardDescription>
                  All tournaments in this league.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700  pb-4"
                    >
                      <div>
                        <h3 className="font-medium">
                          {i <= 3
                            ? `Summer Series Tournament #${i}`
                            : `Spring Series Tournament #${i - 3}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {i <= 3 ? "Season 2" : "Season 1"} -
                          {i === 1
                            ? " Upcoming"
                            : i <= 3
                            ? " In Progress"
                            : " Completed"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(2024, i, 15).toLocaleDateString()}
                        </div>
                        <Link href={`/leagues/${leagueId}/tournaments/${i}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Players</CardTitle>
                <CardDescription>
                  Players with the highest rankings in this league.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700  pb-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          {i}
                        </div>
                        <div>
                          <h3 className="font-medium">Player Name {i}</h3>
                          <p className="text-sm text-muted-foreground">
                            {Math.floor(Math.random() * 8) + 2} tournaments
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">
                          {Math.floor(Math.random() * 500) + 200} pts
                        </div>
                        <Link href={`/players/${i}`}>
                          <Button variant="ghost" size="sm">
                            Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
