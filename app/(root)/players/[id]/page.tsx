"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Trophy,
  Calendar,
  BarChart2,
  Medal,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { getPlayerProfile, type PlayerProfile } from "@/app/__actions/players";

export default function PlayerProfilePage() {
  // Use the useParams hook to get the ID from the route
  const params = useParams();
  const playerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    async function fetchPlayerProfile() {
      try {
        setLoading(true);
        const result = await getPlayerProfile(playerId);

        if (result.success && result.data) {
          setPlayerData(result.data);
        } else {
          setError(result.error || "Failed to fetch player profile");
        }
      } catch (err) {
        console.error("Error fetching player profile:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (playerId) {
      fetchPlayerProfile();
    }
  }, [playerId]);

  function getOrdinal(n: number | null) {
    if (n === null) return "N/A";
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  return (
    <AppLayout>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-6">
            <Link href="/players">
              <button className="material-button-secondary flex items-center gap-1 text-sm py-1">
                <ArrowLeft className="h-4 w-4" />
                Players
              </button>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <h1 className="text-2xl font-medium">{playerData?.player.name}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="material-card">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Total Tournaments
                  </p>
                  <p className="text-2xl font-medium">
                    {playerData?.stats.totalTournaments}
                  </p>
                </div>
              </div>
            </div>

            <div className="material-card">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Medal className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Tournament Wins
                  </p>
                  <p className="text-2xl font-medium">
                    {playerData?.stats.totalWins}
                  </p>
                </div>
              </div>
            </div>

            <div className="material-card">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Points</p>
                  <p className="text-2xl font-medium">
                    {playerData?.stats.totalPoints}
                  </p>
                </div>
              </div>
            </div>

            <div className="material-card">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Best Finish</p>
                  <p className="text-2xl font-medium">
                    {getOrdinal(playerData?.stats.bestFinish || null)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="material-card">
              <div className="material-card-header">
                <h2 className="material-card-title">Tournament History</h2>
                <p className="material-card-subtitle">
                  All tournaments this player has participated in
                </p>
              </div>
              <div className="material-card-content">
                <table className="material-data-table">
                  <thead>
                    <tr>
                      <th>Tournament</th>
                      <th>Date</th>
                      <th>Finish</th>
                      <th>Regular</th>
                      <th>Bounty</th>
                      <th>Consolation</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerData?.tournamentResults.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No tournament history available
                        </td>
                      </tr>
                    ) : (
                      playerData?.tournamentResults.map((result) => (
                        <tr key={result.id}>
                          <td className="font-medium">
                            <Link
                              href={`/tournaments/${result.tournamentId}`}
                              className="hover:text-primary"
                            >
                              {result.tournamentName}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              {result.seriesName} | {result.seasonName}
                            </div>
                          </td>
                          <td>{new Date(result.date).toLocaleDateString()}</td>
                          <td>
                            <span
                              className={`material-chip ${
                                result.finalPosition === 1
                                  ? "bg-primary/10 text-primary"
                                  : result.finalPosition <= 3
                                    ? "bg-accent text-primary"
                                    : ""
                              }`}
                            >
                              {getOrdinal(result.finalPosition)}
                            </span>
                          </td>
                          <td className="text-right">{result.points}</td>
                          <td className="text-right">{result.bountyPoints}</td>
                          <td className="text-right">
                            {result.consolationPoints}
                          </td>
                          <td className="text-right font-medium">
                            {result.totalPoints}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="material-card">
              <div className="material-card-header">
                <h2 className="material-card-title">Series Performance</h2>
                <p className="material-card-subtitle">
                  Player performance across all series
                </p>
              </div>
              <div className="material-card-content">
                <table className="material-data-table">
                  <thead>
                    <tr>
                      <th>Series</th>
                      <th>Tournaments</th>
                      <th>Best</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerData?.seriesScoreboards.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No series data available
                        </td>
                      </tr>
                    ) : (
                      playerData?.seriesScoreboards.map((scoreboard) => (
                        <tr key={scoreboard.id}>
                          <td className="font-medium">
                            <Link
                              href={`/standings/${scoreboard.seriesId}`}
                              className="hover:text-primary"
                            >
                              {scoreboard.seriesName}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              {scoreboard.seasonName}
                            </div>
                          </td>
                          <td>{scoreboard.tournamentCount}</td>
                          <td>{getOrdinal(scoreboard.bestFinish)}</td>
                          <td>
                            <div className="font-medium">
                              {scoreboard.totalPoints}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Regular: {scoreboard.regularPoints} | Bounty:{" "}
                              {scoreboard.bountyPoints} | Consolation:{" "}
                              {scoreboard.consolationPoints}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="material-card">
              <div className="material-card-header">
                <h2 className="material-card-title">Point Breakdown</h2>
                <p className="material-card-subtitle">
                  Detailed breakdown of player's points
                </p>
              </div>
              <div className="material-card-content">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        Regular Points
                      </span>
                      <span className="text-sm">
                        {playerData?.stats.regularPoints}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${
                            playerData?.stats.totalPoints
                              ? Math.min(
                                  100,
                                  (playerData.stats.regularPoints /
                                    playerData.stats.totalPoints) *
                                    100
                                )
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Bounty Points</span>
                      <span className="text-sm">
                        {playerData?.stats.bountyPoints}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${
                            playerData?.stats.totalPoints
                              ? Math.min(
                                  100,
                                  (playerData.stats.bountyPoints /
                                    playerData.stats.totalPoints) *
                                    100
                                )
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        Consolation Points
                      </span>
                      <span className="text-sm">
                        {playerData?.stats.consolationPoints}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${
                            playerData?.stats.totalPoints
                              ? Math.min(
                                  100,
                                  (playerData.stats.consolationPoints /
                                    playerData.stats.totalPoints) *
                                    100
                                )
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="material-card">
              <div className="material-card-header">
                <h2 className="material-card-title">
                  Season Event Qualifications
                </h2>
                <p className="material-card-subtitle">
                  Season finale qualification status
                </p>
              </div>
              <div className="material-card-content">
                <table className="material-data-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Chip Count</th>
                      <th>Status</th>
                      <th>Final Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerData?.qualifications.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No qualification data available
                        </td>
                      </tr>
                    ) : (
                      playerData?.qualifications.map((qualification) => (
                        <tr key={qualification.id}>
                          <td className="font-medium">
                            <Link
                              href={`/qualification`}
                              className="hover:text-primary"
                            >
                              {qualification.seasonEventName}
                            </Link>
                          </td>
                          <td>{qualification.chipCount}</td>
                          <td>
                            <span
                              className={`material-chip ${
                                qualification.qualified
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {qualification.qualified
                                ? "Qualified"
                                : "Not Qualified"}
                            </span>
                          </td>
                          <td>
                            {qualification.finalPosition
                              ? getOrdinal(qualification.finalPosition)
                              : "Not Played"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
