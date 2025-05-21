"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Star,
  Calendar,
  Trophy,
  BarChart2,
  ArrowLeft,
  Plus,
  Edit,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getSeries, getTournamentsBySeries } from "@/app/__actions/series";
import { getSeriesStandings } from "@/app/__actions/standings";

export default function SeriesDetailsPage() {
  const params = useParams();
  const seriesId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [series, setSeries] = useState<any>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [seasonName, setSeasonName] = useState("");
  const [leagueName, setLeagueName] = useState("");

  useEffect(() => {
    async function fetchSeriesData() {
      try {
        setLoading(true);

        // Fetch series data
        const seriesResult = await getSeries();
        if (!seriesResult.success) {
          throw new Error(seriesResult.error || "Failed to fetch series");
        }

        // Find the specific series
        const seriesData = seriesResult?.data?.find(
          (s: any) => s.id === seriesId
        );
        if (!seriesData) {
          throw new Error("Series not found");
        }

        setSeries(seriesData);

        // Fetch tournaments for this series
        const tournamentsResult = await getTournamentsBySeries(seriesId);
        if (!tournamentsResult.success) {
          throw new Error(
            tournamentsResult.error || "Failed to fetch tournaments"
          );
        }

        // Sort tournaments by date (newest first)
        const sortedTournaments = tournamentsResult?.data?.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        if (sortedTournaments) {
          setTournaments(sortedTournaments);
        }

        // Fetch standings for this series
        const standingsResult = await getSeriesStandings(seriesId);
        if (standingsResult.success && standingsResult.data) {
          setStandings(standingsResult.data.standings || []);
          setSeasonName(standingsResult.data.season?.name || "Unknown Season");
          setLeagueName(standingsResult.data.league?.name || "Unknown League");
        }
      } catch (err) {
        console.error("Error fetching series data:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    if (seriesId) {
      fetchSeriesData();
    }
  }, [seriesId]);

  // Calculate series statistics
  const calculateStats = () => {
    if (!series || !tournaments || tournaments.length === 0) {
      return {
        totalTournaments: 0,
        completedTournaments: 0,
        totalPlayers: 0,
        progress: 0,
      };
    }

    const completedTournaments = tournaments.filter(
      (t: any) => t.status === "Completed" || t.isFinalized
    ).length;

    // Calculate total unique players
    const playerSet = new Set();
    tournaments.forEach((tournament: any) => {
      if (tournament.tournamentPlayers) {
        tournament.tournamentPlayers.forEach((playerId: string) => {
          playerSet.add(playerId);
        });
      }
    });

    // Calculate progress
    const progress =
      tournaments.length > 0
        ? Math.floor((completedTournaments / tournaments.length) * 100)
        : 0;

    return {
      totalTournaments: tournaments.length,
      completedTournaments,
      totalPlayers: playerSet.size,
      progress,
    };
  };

  const stats = calculateStats();

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  // Determine series status
  const getSeriesStatus = () => {
    if (!series) return "Unknown";

    if (!series.isActive) return "Completed";

    const now = new Date();
    const startDate = new Date(series.startDate);
    const endDate = series.endDate ? new Date(series.endDate) : null;

    if (now < startDate) return "Upcoming";
    if (endDate && now > endDate) return "Completed";
    return "Active";
  };

  return (
    <>
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
            <Link href="/series">
              <button className="material-button-secondary flex items-center gap-1 text-sm py-1">
                <ArrowLeft className="h-4 w-4" />
                All Series
              </button>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <h1 className="text-2xl font-medium">{series.name}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="material-card">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium">{series.name}</h2>
                    <p className="text-muted-foreground">
                      {seasonName} • {leagueName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Series Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span
                          className={`material-chip ${
                            getSeriesStatus() === "Active"
                              ? "bg-primary-50 text-primary"
                              : getSeriesStatus() === "Upcoming"
                                ? "bg-accent text-primary"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {getSeriesStatus()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Start Date:
                        </span>
                        <span>{formatDate(series.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End Date:</span>
                        <span>
                          {series.endDate
                            ? formatDate(series.endDate)
                            : "Ongoing"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Points System:
                        </span>
                        <span className="capitalize">
                          {series.pointsSystem || "Weighted"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Series Statistics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Tournaments:
                        </span>
                        <span>{stats.totalTournaments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Completed Tournaments:
                        </span>
                        <span>{stats.completedTournaments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Players:
                        </span>
                        <span>{stats.totalPlayers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Progress:</span>
                        <span>{stats.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {series.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Description
                    </h3>
                    <p className="text-sm">{series.description}</p>
                  </div>
                )}

                {getSeriesStatus() === "Active" && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Series Progress
                    </h3>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${stats.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Link href={`/results/create`}>
                    <button className="material-button-primary bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Tournament
                    </button>
                  </Link>
                   {/* <Link href={`/series/${seriesId}/edit`}>
                    <button className="material-button-secondary flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Series
                    </button>
                  </Link>
                 <Link href={`/standings/${seriesId}`}>
                    <button className="material-button-secondary flex items-center gap-2">
                      <BarChart2 className="h-4 w-4" />
                      View Standings
                    </button>
                  </Link> */}
                </div>
              </div>
            </div>

            <div className="material-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Top Players</h3>
              </div>

              {standings.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No standings data available yet
                </div>
              ) : (
                <div className="space-y-4">
                  {standings.slice(0, 5).map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <Link
                          href={`/players/${player.playerId}`}
                          className="hover:text-primary"
                        >
                          <span className="font-medium">
                            {player.playerName}
                          </span>
                        </Link>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {player.totalPoints} pts
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {player.tournamentCount} tournaments
                        </div>
                      </div>
                    </div>
                  ))}

                  <Link
                    href={`/standings/${seriesId}`}
                    className="block text-center mt-4"
                  >
                    <button className="material-button-secondary text-sm w-full">
                      View Full Standings
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* <div className="material-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Tournaments</h3>
              </div>
              <Link href={`/results/create?seriesId=${seriesId}`}>
                <button className="material-button-secondary text-sm flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Tournament
                </button>
              </Link>
            </div>

            {tournaments.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-md">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Tournaments Yet</h3>
                <p className="text-muted-foreground mb-4">
                  This series doesn't have any tournaments yet.
                </p>
                <Link href={`/results/create?seriesId=${seriesId}`}>
                  <button className="material-button-primary">
                    Add First Tournament
                  </button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="material-data-table">
                  <thead>
                    <tr>
                      <th>Tournament</th>
                      <th>Date</th>
                      <th>Players</th>
                      <th>Winner</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map((tournament: any) => {
                      // Find winner (player with position 1)
                      let winnerName = "No results";
                      if (
                        tournament.tournamentPlayers &&
                        tournament.tournamentPlayers.length > 0
                      ) {
                        // This would require additional data fetching in a real implementation
                        // For now, we'll use a placeholder
                        winnerName = "Winner TBD";
                      }

                      return (
                        <tr key={tournament.id}>
                          <td className="font-medium">{tournament.name}</td>
                          <td>{formatDate(tournament.date)}</td>
                          <td>{tournament.totalPlayers || "N/A"}</td>
                          <td>{winnerName}</td>
                          <td>
                            <span
                              className={`material-chip ${
                                tournament.isFinalized ||
                                tournament.status === "Completed"
                                  ? "bg-green-50 text-green-700"
                                  : tournament.status === "Scheduled"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {tournament.isFinalized ||
                              tournament.status === "Completed"
                                ? "Completed"
                                : tournament.status || "Draft"}
                            </span>
                          </td>
                          <td>
                            <Link href={`/results/${tournament.id}`}>
                              <button className="material-button-secondary text-sm py-1">
                                View
                              </button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div> */}

          {/* <div className="material-card mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                <BarChart2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Series Standings</h3>
            </div>

            {standings.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-md">
                <BarChart2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Standings Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Standings will appear once tournaments have been completed.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="material-data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>Regular</th>
                      <th>Bounty</th>
                      <th>Consolation</th>
                      <th>Total Points</th>
                      <th>Tournaments</th>
                      <th>Best Finish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((player, index) => (
                      <tr key={player.id}>
                        <td className="w-16 text-center">{index + 1}</td>
                        <td>
                          <Link
                            href={`/players/${player.playerId}`}
                            className="hover:text-primary"
                          >
                            {player.playerName}
                          </Link>
                        </td>
                        <td className="text-right">{player.regularPoints}</td>
                        <td className="text-right">{player.bountyPoints}</td>
                        <td className="text-right">
                          {player.consolationPoints}
                        </td>
                        <td className="text-right font-medium">
                          {player.totalPoints}
                        </td>
                        <td className="text-center">
                          {player.tournamentCount}
                        </td>
                        <td className="text-center">
                          {player.bestFinish
                            ? `${player.bestFinish}${getOrdinalSuffix(player.bestFinish)}`
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {standings.length > 0 && (
              <div className="mt-4 text-center">
                <Link href={`/standings/${seriesId}`}>
                  <button className="material-button-secondary">
                    View Full Standings
                  </button>
                </Link>
              </div>
            )}
          </div> */}
        </>
      )}
    </>
  );
}

function getOrdinalSuffix(n: number) {
  if (n === 0) return "";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
