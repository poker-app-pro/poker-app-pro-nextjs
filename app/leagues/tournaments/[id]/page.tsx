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
import { ChevronRight, Trophy, Calendar, Users, Clock } from "lucide-react";
import Link from "next/link";

export default async function TournamentDetailsPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const tournamentId = params.id;

  return (
    <AppLayout
      title={`Tournament Details: Summer Series Tournament #${tournamentId}`}
    >
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
              <Link href="/leagues/1">
                <Button variant="ghost" size="sm">
                  Texas Hold&apos;em League
                </Button>
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link href="/leagues/1/tournaments">
                <Button variant="ghost" size="sm">
                  Tournaments
                </Button>
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <h1 className="text-3xl font-bold tracking-tight">
                Summer Series Tournament #{tournamentId}
              </h1>
            </div>
            <p className="text-muted-foreground">
              Texas Hold&apos;em - {new Date(2024, 3, 15).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Edit Tournament
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Completed</div>
              <p className="text-xs text-muted-foreground">
                Ended on {new Date(2024, 3, 15).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">
                8 tables of 4 players
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buy-in</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$100</div>
              <p className="text-xs text-muted-foreground">
                Total prize pool: $3,200
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Series</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Summer Series</div>
              <p className="text-xs text-muted-foreground">Tournament 2 of 4</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="results">
          <TabsList>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="details">Tournament Details</TabsTrigger>
          </TabsList>
          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Final Results</CardTitle>
                <CardDescription>
                  Final standings and points awarded.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700  pb-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-medium">
                            Player {String.fromCharCode(65 + i)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {i === 0
                              ? "Winner"
                              : i === 1
                              ? "Runner-up"
                              : `${i + 1}th Place`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <div className="text-sm font-medium">
                            {i === 0
                              ? "$1,200"
                              : i === 1
                              ? "$800"
                              : i === 2
                              ? "$500"
                              : i < 5
                              ? "$175"
                              : ""}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.floor(100 - i * 10)} points
                          </div>
                        </div>
                        <Link href={`/players/${i + 1}`}>
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
          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tournament Roster</CardTitle>
                <CardDescription>
                  All players who participated in this tournament.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700  pb-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div>
                        <h3 className="font-medium">
                          Player {String.fromCharCode(65 + i)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {i < 10
                            ? `Finished ${i + 1}${
                                i === 0
                                  ? "st"
                                  : i === 1
                                  ? "nd"
                                  : i === 2
                                  ? "rd"
                                  : "th"
                              }`
                            : "Eliminated"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tournament Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium">Tournament Name</h3>
                        <p className="text-sm">
                          Summer Series Tournament #{tournamentId}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Date</h3>
                        <p className="text-sm">
                          {new Date(2024, 3, 15).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Start Time</h3>
                        <p className="text-sm">7:00 PM</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">End Time</h3>
                        <p className="text-sm">11:30 PM</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Location</h3>
                        <p className="text-sm">Poker Club, 123 Main St</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Game Type</h3>
                        <p className="text-sm">Texas Hold&apos;em</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Buy-in</h3>
                        <p className="text-sm">$100</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Re-buys</h3>
                        <p className="text-sm">Not Allowed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Structure & Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Starting Chips</h3>
                      <p className="text-sm">10,000</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Blind Structure</h3>
                      <p className="text-sm">
                        15-minute levels, starting at 25/50
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Payout Structure</h3>
                      <p className="text-sm">
                        1st: 40%, 2nd: 25%, 3rd: 15%, 4th-5th: 5% each
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Points Awarded</h3>
                      <p className="text-sm">
                        1st: 100, 2nd: 90, 3rd: 80, decreasing by 10 for each
                        position
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Special Rules</h3>
                      <p className="text-sm">
                        Standard tournament rules apply. No electronic devices
                        at the table.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
