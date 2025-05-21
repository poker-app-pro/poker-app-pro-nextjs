"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; 
import {
  Star, 
  Trophy, 
  ArrowLeft,
  Plus,
  Edit,
  Loader2,
  AlertCircle,
  ChevronRight,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  getSeries,
  getTournamentsBySeries,
  deleteSeries,
} from "@/app/__actions/series";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { getSeriesStandings } from "@/app/__actions/standings";

export default function SeriesDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [series, setSeries] = useState<any>(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tournaments, setTournaments] = useState<any[]>([]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [standings, setStandings] = useState<any[]>([]);
  const [seasonName, setSeasonName] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteSeries(seriesId, series.userId);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete series");
      }

      // Close the modal and redirect
      setIsDeleteModalOpen(false);
      router.push("/series");
    } catch (err) {
      console.error("Error deleting series:", err);
      setDeleteError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsDeleting(false);
    }
  }

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (t: any) => t.status === "Completed" || t.isFinalized
    ).length;

    // Calculate total unique players
    const playerSet = new Set();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                  <Link href={`/results/create?seriesId=${seriesId}`}>
                    <button className="material-button-primary bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Tournament
                    </button>
                  </Link>
                  <Link href={`/series/${seriesId}/edit`}>
                    <button className="material-button-secondary flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Series
                    </button>
                  </Link>
                  <button
                    className="material-button-secondary text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Series
                  </button>
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
        </>
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Series"
        message={`Are you sure you want to delete "${series?.name}"? This action cannot be undone. All standings data for this series will be permanently removed. Note: You must delete all tournaments in this series before it can be deleted.`}
        isDeleting={isDeleting}
      />

      {deleteError && (
        <div className="fixed bottom-4 right-4 bg-destructive/10 text-destructive p-4 rounded-md shadow-lg max-w-md">
          <p className="font-medium">Error</p>
          <p>{deleteError}</p>
        </div>
      )}
    </>
  );
} 