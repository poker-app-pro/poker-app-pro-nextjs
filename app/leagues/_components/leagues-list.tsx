"use client";
import { useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Plus, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { client } from "@/components/AmplifyClient";

const LeaguesList = () => {
  useEffect(() => {
    const getLeagues = async () => {
      try {
        const leaguesData = await client.models.League.list({
          authMode: "userPool",
        });
        console.log("leaguesData", leaguesData);
      } catch (err) {
        console.log(err);
      }
    };
    getLeagues();
  }, []);
  return (
    <Tabs defaultValue="active">
      <TabsList>
        <TabsTrigger value="active">Active Leagues</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Texas Hold&apos;em League {i}
                </CardTitle>
                <CardDescription>
                  {i === 1 ? "Current Season" : `Season ${i} (${2023 + i})`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{Math.floor(Math.random() * 100) + 20} players</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>
                      {Math.floor(Math.random() * 10) + 5} tournaments
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {i === 1 ? "Season in progress" : "Season completed"}
                </p>
              </CardContent>
              <CardFooter className="pt-2">
                <Link href={`/leagues/${i}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View League
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          <Card className="flex flex-col items-center justify-center p-6 border-dashed border-gray-200 dark:border-gray-700 ">
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">Create a new league</p>
            <Link href="/leagues/create">
              <Button>New League</Button>
            </Link>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="archived" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <Card
              key={i}
              className="overflow-hidden opacity-70 hover:opacity-100 transition-opacity"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                  Archived League {i}
                </CardTitle>
                <CardDescription>Season {i} (2022)</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{Math.floor(Math.random() * 100) + 20} players</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>
                      {Math.floor(Math.random() * 10) + 5} tournaments
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-muted-foreground w-full"></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Archived on{" "}
                  {new Date(
                    2022,
                    Math.floor(Math.random() * 12),
                    Math.floor(Math.random() * 28) + 1
                  ).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="pt-2">
                <Link href={`/leagues/${i + 10}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Archive
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default LeaguesList;
