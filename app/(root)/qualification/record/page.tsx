"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type React from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Trophy,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  DollarSign,
} from "lucide-react";
import {
  getActiveSeasons,
  getQualifiedPlayers,
  recordSeasonEventResults,
} from "@/app/__actions/qualification";
import { getCurrentUser } from "aws-amplify/auth";

type FormState = "idle" | "submitting" | "success" | "error";

interface QualifiedPlayer {
  id: string;
  name: string;
  tournamentCount: number;
  totalChips: number;
  qualificationType?: string;
  position?: number;
  prize?: number;
}

export default function RecordSeasonEventPage() {
  const router = useRouter();

  // Form state
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [seasons, setSeasons] = useState<{ id: string; name: string }[]>([]);
  const [qualifiedPlayers, setQualifiedPlayers] = useState<QualifiedPlayer[]>(
    []
  );
  const [finalRankings, setFinalRankings] = useState<QualifiedPlayer[]>([]);

  // Form fields
  const [seasonId, setSeasonId] = useState<string>("");
  const [eventName, setEventName] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });

  // Validation errors
  const [seasonError, setSeasonError] = useState<string>("");
  const [eventNameError, setEventNameError] = useState<string>("");
  const [eventDateError, setEventDateError] = useState<string>("");
  const [rankingsError, setRankingsError] = useState<string>("");

  // Loading state
  const [loading, setLoading] = useState<boolean>(true);

  // Load seasons on mount
  useEffect(() => {
    async function loadSeasons() {
      try {
        const result = await getActiveSeasons();
        if (result.success && (result?.data?.length as number) > 0) {
          if (result.data) {
            setSeasons(result.data);
          }
        } else {
          setError("No active seasons found");
        }
      } catch (err) {
        console.error("Error loading seasons:", err);
        setError("Failed to load seasons");
      } finally {
        setLoading(false);
      }
    }

    loadSeasons();
  }, []);

  // Load qualified players when season changes
  useEffect(() => {
    if (!seasonId) return;

    async function loadQualifiedPlayers() {
      setLoading(true);
      try {
        const result = await getQualifiedPlayers(seasonId);
        if (result.success && result.data) {
          setQualifiedPlayers(result.data);

          // Pre-populate event name
          const season = seasons.find((s) => s.id === seasonId);
          if (season) {
            setEventName(`${season.name} - Season Event`);
          }
        } else {
          setError("Failed to load qualified players");
        }
      } catch (err) {
        console.error("Error loading qualified players:", err);
        setError("Failed to load qualified players");
      } finally {
        setLoading(false);
      }
    }

    loadQualifiedPlayers();
  }, [seasonId, seasons]);

  // Add player to final rankings
  const addPlayerToRankings = (player: QualifiedPlayer) => {
    // Check if player is already in rankings
    if (finalRankings.some((p) => p.id === player.id)) return;

    // Add player to rankings with next position
    const nextPosition = finalRankings.length + 1;
    const prize = calculatePrize(nextPosition);

    setFinalRankings([
      ...finalRankings,
      { ...player, position: nextPosition, prize },
    ]);
  };

  // Remove player from rankings
  const removePlayerFromRankings = (playerId: string) => {
    const updatedRankings = finalRankings
      .filter((p) => p.id !== playerId)
      .map((player, index) => ({
        ...player,
        position: index + 1,
        prize: calculatePrize(index + 1),
      }));

    setFinalRankings(updatedRankings);
  };

  // Calculate prize based on position
  const calculatePrize = (position: number): number => {
    switch (position) {
      case 1:
        return 1200;
      case 2:
        return 800;
      case 3:
        return 500;
      case 4:
        return 300;
      case 5:
        return 200;
      default:
        return 0;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setSeasonError("");
    setEventNameError("");
    setEventDateError("");
    setRankingsError("");

    // Validate season
    if (!seasonId) {
      setSeasonError("Please select a season");
      isValid = false;
    }

    // Validate event name
    if (!eventName.trim()) {
      setEventNameError("Event name is required");
      isValid = false;
    }

    // Validate event date
    if (!eventDate) {
      setEventDateError("Event date is required");
      isValid = false;
    }

    // Validate rankings
    if (finalRankings.length === 0) {
      setRankingsError("Please add at least one player to the rankings");
      isValid = false;
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setState("submitting");
    setError(null);

    try {
      const user = await getCurrentUser();

      const formData = new FormData();
      formData.append("seasonId", seasonId);
      formData.append("eventName", eventName);
      formData.append("eventDate", eventDate);
      formData.append("results", JSON.stringify(finalRankings));
      formData.append("userId", user.userId);

      const result = await recordSeasonEventResults(formData);

      if (result.success) {
        setState("success");
        setTimeout(() => {
          router.push("/qualification");
        }, 2000);
      } else {
        setState("error");
        setError(result.error as string);
      }
    } catch (err) {
      console.error("Error recording results:", err);
      setState("error");
      setError("Failed to record season event results");
    }
  };

  const breadcrumbItems = [
    { label: "Season Event", href: "/qualification" },
    { label: "Record Results" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="max-w-4xl mx-auto">
        {state === "error" && error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {state === "success" ? (
          <div className="material-card p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-4 flex items-center justify-center">
              <Trophy className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-medium mb-2">
              Results Recorded Successfully!
            </h2>
            <p className="text-muted-foreground mb-6">
              The season event results have been saved.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to Season Event page...
            </p>
          </div>
        ) : (
          <div className="material-card">
            <div className="material-card-header">
              <h2 className="material-card-title flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Record Season Event Results
              </h2>
              <p className="material-card-subtitle">
                Record the final standings for the season event
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="material-card-content space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="season" className="material-label">
                    Season*
                  </label>
                  <select
                    id="season"
                    value={seasonId}
                    onChange={(e) => setSeasonId(e.target.value)}
                    className={`material-input ${seasonError ? "border-destructive" : ""}`}
                    disabled={state === "submitting" || loading}
                  >
                    <option value="">Select a season</option>
                    {seasons.map((season) => (
                      <option key={season.id} value={season.id}>
                        {season.name}
                      </option>
                    ))}
                  </select>
                  {seasonError && (
                    <p className="text-destructive text-xs mt-1">
                      {seasonError}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="eventDate"
                    className="material-label flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Event Date*
                  </label>
                  <input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className={`material-input ${eventDateError ? "border-destructive" : ""}`}
                    disabled={state === "submitting"}
                  />
                  {eventDateError && (
                    <p className="text-destructive text-xs mt-1">
                      {eventDateError}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="eventName" className="material-label">
                  Event Name*
                </label>
                <input
                  id="eventName"
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className={`material-input ${eventNameError ? "border-destructive" : ""}`}
                  placeholder="e.g., Summer Season 2023 - Season Event"
                  disabled={state === "submitting"}
                />
                {eventNameError && (
                  <p className="text-destructive text-xs mt-1">
                    {eventNameError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Qualified Players
                  </h3>

                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : qualifiedPlayers.length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-gray-200 rounded-md">
                      <p className="text-muted-foreground">
                        No qualified players found
                      </p>
                    </div>
                  ) : (
                    <div className="h-[400px] overflow-y-auto border border-gray-200 rounded-md">
                      <table className="w-full">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                              Player
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                              Chips
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground w-16">
                              Add
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {qualifiedPlayers
                            .filter(
                              (player) =>
                                !finalRankings.some((p) => p.id === player.id)
                            )
                            .map((player) => (
                              <tr
                                key={player.id}
                                className="border-t border-gray-200 hover:bg-muted/50"
                              >
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary">
                                      {player.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{player.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  {player.totalChips.toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => addPlayerToRankings(player)}
                                    className="p-1 rounded-full hover:bg-primary/10 text-primary"
                                    disabled={state === "submitting"}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M12 5v14M5 12h14" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Final Rankings
                  </h3>

                  {finalRankings.length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-gray-200 rounded-md">
                      <p className="text-muted-foreground">
                        No players added to rankings yet
                      </p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-md">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground w-16">
                              Pos
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                              Player
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                              <DollarSign className="h-3 w-3 inline" />
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground w-16">
                              Remove
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {finalRankings.map((player) => (
                            <tr
                              key={player.id}
                              className="border-t border-gray-200 hover:bg-muted/50"
                            >
                              <td className="px-4 py-2 text-center font-medium">
                                {player.position}
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary">
                                    {player.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span>{player.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-right">
                                {formatCurrency(player.prize || 0)}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    removePlayerFromRankings(player.id)
                                  }
                                  className="p-1 rounded-full hover:bg-destructive/10 text-destructive"
                                  disabled={state === "submitting"}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M5 12h14" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {rankingsError && (
                    <p className="text-destructive text-xs mt-2">
                      {rankingsError}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/qualification")}
                  className="material-button-secondary"
                  disabled={state === "submitting"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="material-button-primary bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  disabled={state === "submitting" || loading}
                >
                  {state === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Results...
                    </>
                  ) : (
                    "Save Results"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
