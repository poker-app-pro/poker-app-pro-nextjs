import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cookieBasedClient } from "@/lib/amplify-utils";
 import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { notFound } from "next/navigation";
import { getLeague } from "@/app/__actions/league";
import { Schema } from "@/amplify/data/resource";

async function getLeagueDetails(leagueId: string) {
  try {
    // Get league data
    const leagueResult = await getLeague(leagueId);
    if (!leagueResult.success || !leagueResult.data) {
      return {
        success: false,
        error: leagueResult.error || "League not found",
      };
    }

    const league = leagueResult.data;

    // Get seasons count
    const seasonsCount = league.seasons?.length || 0;

    // Get series count
    const seriesCount = league.series?.length || 0;

    // Get tournaments count
    const tournamentsCount = league.tournaments?.length || 0;

    // Get results count (using tournaments that have results)
    let resultsCount = 0;
    if (league.tournaments && league.tournaments.length > 0) {
      for (const tournamentId of league.tournaments) {
        const tournamentResult = await cookieBasedClient.models.Tournament.get(
          { id: tournamentId as string },
          { authMode: "userPool" }
        );
        if (
          tournamentResult.data &&
          tournamentResult.data.status === "Completed"
        ) {
          resultsCount++;
        }
      }
    }

    // Get seasons data
    const seasons = [];
    if (league.seasons && league.seasons.length > 0) {
      for (const seasonId of league.seasons) {
        const seasonResult = await cookieBasedClient.models.Season.get(
          { id: seasonId as string },
          { authMode: "userPool" }
        );
        if (seasonResult.data) {
          seasons.push(seasonResult.data);
        }
      }
    }

    // Get series data
    const series = [];
    if (league.series && league.series.length > 0) {
      for (const seriesId of league.series) {
        const seriesResult = await cookieBasedClient.models.Series.get(
          { id: seriesId as string },
          { authMode: "userPool" }
        );
        if (seriesResult.data) {
          series.push(seriesResult.data);
        }
      }
    }

    // Get recent results
    let recentResults: Schema["Tournament"]["type"][] = [];
    if (league.tournaments && league.tournaments.length > 0) {
      const tournaments = [];
      for (const tournamentId of league.tournaments) {
        const tournamentResult = await cookieBasedClient.models.Tournament.get(
          { id: tournamentId as string },
          { authMode: "userPool" }
        );
        if (
          tournamentResult.data &&
          tournamentResult.data.status === "Completed"
        ) {
          tournaments.push(tournamentResult.data);
        }
      }

      // Sort by date (most recent first) and take top 5
      recentResults = tournaments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    }

    // Get players count (unique players across all tournaments)
    const playerIds = new Set();
    if (league.tournaments && league.tournaments.length > 0) {
      for (const tournamentId of league.tournaments) {
        const tournamentResult = await cookieBasedClient.models.Tournament.get(
          { id: tournamentId as string },
          { authMode: "userPool" }
        );
        if (tournamentResult.data && tournamentResult.data.tournamentPlayers) {
          for (const tpId of tournamentResult.data.tournamentPlayers) {
            const tpResult =
              await cookieBasedClient.models.TournamentPlayer.get(
                { id: tpId as string },
                { authMode: "userPool" }
              );
            if (tpResult.data && tpResult.data.playerId) {
              playerIds.add(tpResult.data.playerId);
            }
          }
        }
      }
    }

    return {
      success: true,
      data: {
        league,
        stats: {
          seasonsCount,
          seriesCount,
          tournamentsCount,
          resultsCount,
          playersCount: playerIds.size,
        },
        seasons,
        series,
        recentResults,
      },
    };
  } catch (error) {
    console.error("Error fetching league details:", error);
    return { success: false, error: "Failed to fetch league details" };
  }
}

export default async function LeagueDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const leagueDetails = await getLeagueDetails(id);

  if (!leagueDetails.success || !leagueDetails.data) {
    notFound();
  }

  const { league, stats, seasons, series, recentResults } = leagueDetails.data;

  return (
    <>
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
                {league.name}
              </h1>
            </div>
            {league.description && (
              <p className="text-muted-foreground mt-1">{league.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/seasons/create`}>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                New Season
              </Button>
            </Link>
            <Link href={`/results/create?leagueId=${id}`}>
              <Button>
                <Trophy className="mr-2 h-4 w-4" />
                Add Results
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Seasons</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.seasonsCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Series</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.seriesCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.playersCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Results</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resultsCount}</div>
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

          {/* Seasons Tab */}
          <TabsContent value="seasons" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {seasons.length > 0 ? (
                seasons.map((season) => (
                  <Card key={season.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle>{season.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Start Date:
                          </span>
                          <span className="text-sm">
                            {new Date(season.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Status:
                          </span>
                          <span className="text-sm">
                            {season.isActive ? "Active" : "Completed"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <div className="p-4 pt-0 flex gap-2">
                      <Link
                        href={`/seasons/${season.id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full">
                          View
                        </Button>
                      </Link>
                      <Link
                        href={`/results/create?seasonId=${season.id}`}
                        className="flex-1"
                      >
                        <Button className="w-full">Add Results</Button>
                      </Link>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full p-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">No seasons found</p>
                  </div>
                </Card>
              )}
              <Card className="flex flex-col items-center justify-center p-6 border-dashed">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">
                  Create a new season
                </p>
                <Link href={`/seasons/create`}>
                  <Button>New Season</Button>
                </Link>
              </Card>
            </div>
          </TabsContent>

          {/* Series Tab */}
          <TabsContent value="series" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {series.length > 0 ? (
                series.map((s) => (
                  <Card key={s.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle>{s.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Type:
                          </span>
                          <span className="text-sm">{"Standard"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Status:
                          </span>
                          <span className="text-sm">
                            {s.isActive ? "Active" : "Completed"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <div className="p-4 pt-0 flex gap-2">
                      <Link href={`/series/${s.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View
                        </Button>
                      </Link>
                      <Link
                        href={`/results/create?seriesId=${s.id}`}
                        className="flex-1"
                      >
                        <Button className="w-full">Add Results</Button>
                      </Link>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full p-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">No series found</p>
                  </div>
                </Card>
              )}
              <Card className="flex flex-col items-center justify-center p-6 border-dashed">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">
                  Create a new series
                </p>
                <Link href={`/series/create?leagueId=${id}`}>
                  <Button>New Series</Button>
                </Link>
              </Card>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            {recentResults.length > 0 ? (
              <div className="space-y-4">
                {recentResults.map((result: Schema["Tournament"]["type"]) => (
                  <Card key={result.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle>{result.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(result.date).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm">
                        <span>
                          Players: {result.tournamentPlayers?.length || 0}
                        </span>
                        <span>Status: {result.status}</span>
                      </div>
                    </CardContent>
                    <div className="p-4 pt-0">
                      <Link href={`/results/${result.id}`}>
                        <Button variant="outline" className="w-full">
                          View Results
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
                <div className="text-center">
                  <Link href={`/results?leagueId=${id}`}>
                    <Button variant="outline">View All Results</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-muted-foreground">No results found</p>
                  <Link
                    href={`/results/create?leagueId=${id}`}
                    className="mt-4 inline-block"
                  >
                    <Button>Add Results</Button>
                  </Link>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-4">
            <Card className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  {stats.playersCount > 0
                    ? `${stats.playersCount} players have participated in this league's tournaments.`
                    : "No players found for this league."}
                </p>
                <Link href="/players" className="mt-4 inline-block">
                  <Button variant="outline">View All Players</Button>
                </Link>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <FloatingActionButton />
    </>
  );
}
