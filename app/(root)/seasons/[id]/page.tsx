"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
 import {
  Calendar,
  Star,
  Trophy, 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getSeasonById, deleteSeason } from "@/app/__actions/seasons";
import { getSeriesBySeason } from "@/app/__actions/series";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

export default function SeasonDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const seasonId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [season, setSeason] = useState<any>(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [series, setSeries] = useState<any[]>([]);
  const [leagueName, setLeagueName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchSeasonData() {
      try {
        setLoading(true);

        // Fetch season data
        const seasonResult = await getSeasonById(seasonId);
        if (!seasonResult.success) {
          throw new Error(seasonResult.error || "Failed to fetch season");
        }

        setSeason(seasonResult.data);
        setLeagueName(seasonResult?.data?.leagueName || "Unknown League");

        // Fetch series for this season
        const seriesResult = await getSeriesBySeason(seasonId);
        if (!seriesResult.success) {
          throw new Error(seriesResult.error || "Failed to fetch series");
        }

        setSeries(seriesResult.data || []);
      } catch (err) {
        console.error("Error fetching season data:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    if (seasonId) {
      fetchSeasonData();
    }
  }, [seasonId]);

  // Calculate season statistics
  const calculateStats = () => {
    if (!season || !series) {
      return {
        totalSeries: 0,
        activeSeries: 0,
        totalTournaments: 0,
        totalPlayers: 0,
        progress: 0,
      };
    }

    const totalSeries = series.length;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeSeries = series.filter((s: any) => s.isActive).length;

    // Calculate total tournaments
    const totalTournaments = season.tournaments?.length || 0;

    // Calculate progress
    let progress = 0;
    if (season.startDate && season.endDate) {
      const start = new Date(season.startDate).getTime();
      const end = new Date(season.endDate).getTime();
      const now = new Date().getTime();

      if (now <= start) progress = 0;
      else if (now >= end) progress = 100;
      else progress = Math.floor(((now - start) / (end - start)) * 100);
    }

    return {
      totalSeries,
      activeSeries,
      totalTournaments,
      progress,
    };
  };

  const stats = calculateStats();

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  // Determine season status
  const getSeasonStatus = () => {
    if (!season) return "Unknown";

    if (!season.isActive) return "Completed";

    const now = new Date();
    const startDate = new Date(season.startDate);
    const endDate = season.endDate ? new Date(season.endDate) : null;

    if (now < startDate) return "Upcoming";
    if (endDate && now > endDate) return "Completed";
    return "Active";
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteSeason(seasonId);

      if (result.success) {
        router.push("/seasons");
      } else {
        setError(result.error || "Failed to delete season");
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      console.error("Error deleting season:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
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
            <Link href="/seasons">
              <button className="material-button-secondary flex items-center gap-1 text-sm py-1">
                <ArrowLeft className="h-4 w-4" />
                All Seasons
              </button>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <h1 className="text-2xl font-medium">{season.name}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="material-card">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium">{season.name}</h2>
                    <p className="text-muted-foreground">{leagueName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Season Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span
                          className={`material-chip ${
                            getSeasonStatus() === "Active"
                              ? "bg-primary-50 text-primary"
                              : getSeasonStatus() === "Upcoming"
                                ? "bg-accent text-primary"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {getSeasonStatus()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Start Date:
                        </span>
                        <span>{formatDate(season.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End Date:</span>
                        <span>
                          {season.endDate
                            ? formatDate(season.endDate)
                            : "Ongoing"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Season Statistics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Series:
                        </span>
                        <span>{stats.totalSeries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Active Series:
                        </span>
                        <span>{stats.activeSeries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Tournaments:
                        </span>
                        <span>{stats.totalTournaments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Progress:</span>
                        <span>{stats.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {season.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Description
                    </h3>
                    <p className="text-sm">{season.description}</p>
                  </div>
                )}

                {getSeasonStatus() === "Active" && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Season Progress
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
                  <Link
                    href={`/series/create`}
                  >
                    <button className="material-button-primary bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Series
                    </button>
                  </Link>
                  <Link href={`/seasons/${seasonId}/edit`}>
                    <button className="material-button-secondary flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Season
                    </button>
                  </Link>
                  <button
                    className="material-button-secondary text-destructive flex items-center gap-2"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Season
                  </button>
                </div>
              </div>
            </div>

            <div className="material-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium">League Information</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">League:</span>
                  <Link
                    href={`/leagues/${season.leagueId}`}
                    className="hover:text-primary"
                  >
                    <span className="font-medium">{leagueName}</span>
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Series Count:</span>
                  <span className="font-medium">{stats.totalSeries}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Tournament Count:
                  </span>
                  <span className="font-medium">{stats.totalTournaments}</span>
                </div>

                <Link
                  href={`/leagues/${season.leagueId}`}
                  className="block text-center mt-4"
                >
                  <button className="material-button-secondary text-sm w-full">
                    View League
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Series</h3>
              </div>
              <Link
                href={`/series/create`}
              >
                <button className="material-button-secondary text-sm flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Series
                </button>
              </Link>
            </div>

            {series.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-md">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Series Yet</h3>
                <p className="text-muted-foreground mb-4">
                  This season doesn't have any series yet.
                </p>
                <Link
                  href={`/series/create`}
                >
                  <button className="material-button-primary">
                    Add First Series
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {series.map(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (seriesItem: any) => {
                  // Calculate progress for each series
                  const totalTournaments = seriesItem.tournaments?.length || 0;
                  const completedTournaments =
                    seriesItem.tournaments?.filter(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (t: any) => t.status === "Completed" || t.isFinalized
                    ).length || 0;
                  const progress =
                    totalTournaments > 0
                      ? Math.floor(
                          (completedTournaments / totalTournaments) * 100
                        )
                      : 0;

                  return (
                    <div key={seriesItem.id} className="material-card">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                          <Star className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{seriesItem.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(seriesItem.startDate)} -{" "}
                            {seriesItem.endDate
                              ? formatDate(seriesItem.endDate)
                              : "Ongoing"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Tournaments:
                          </span>
                          <span>{totalTournaments}</span>
                        </div>

                        {seriesItem.isActive && totalTournaments > 0 && (
                          <div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Progress: {progress}%
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <span
                          className={`material-chip ${
                            seriesItem.isActive
                              ? "bg-primary-50 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {seriesItem.isActive ? "Active" : "Completed"}
                        </span>

                        <Link href={`/series/${seriesItem.id}`}>
                          <button className="material-button-secondary text-sm py-1">
                            View
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* <div className="material-card mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                <BarChart2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Season Standings</h3>
            </div>

            <div className="text-center py-8 border border-dashed border-gray-200 rounded-md">
              <BarChart2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Season Standings</h3>
              <p className="text-muted-foreground mb-4">
                View combined standings across all series in this season.
              </p>
              <Link href={`/standings?seasonId=${seasonId}`}>
                <button className="material-button-primary">
                  View Standings
                </button>
              </Link>
            </div>
          </div> */}

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
            title="Delete Season"
            message={`Are you sure you want to delete the season "${season?.name}"? This action cannot be undone and will delete all associated data.`}
            isDeleting={isDeleting}
          />
        </>
      )}
    </>
  );
}
