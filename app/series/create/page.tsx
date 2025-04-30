"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Star, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import { useHierarchy } from "@/contexts/hierarchy-context";
import { client } from "@/components/AmplifyClient";
import { getCurrentUser } from "aws-amplify/auth";

type FormState = "idle" | "submitting" | "success" | "error";
type PointsSystem = "standard" | "weighted" | "custom";

// Mock data for leagues and seasons
const MOCK_LEAGUES = [
  { id: "1", name: "Texas Hold'em League" },
  { id: "2", name: "Omaha League" },
  { id: "3", name: "Seven Card Stud League" },
];

const MOCK_SEASONS = [
  { id: "1", name: "Spring Season 2023", leagueId: "1" },
  { id: "2", name: "Summer Season 2023", leagueId: "1" },
  { id: "3", name: "Fall Season 2023", leagueId: "1" },
  { id: "4", name: "Winter Season 2023", leagueId: "2" },
];

export default function CreateSeriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeLeague, activeSeason } = useHierarchy();

  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [leagueId, setLeagueId] = useState("");
  const [seasonId, setSeasonId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [pointsSystem, setPointsSystem] = useState<PointsSystem>("standard");
  const [customPointsConfig, setCustomPointsConfig] = useState("");

  // Filtered seasons based on selected league
  const [filteredSeasons, setFilteredSeasons] = useState(MOCK_SEASONS);

  // Validation errors
  const [nameError, setNameError] = useState("");
  const [leagueError, setLeagueError] = useState("");
  const [seasonError, setSeasonError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [customPointsError, setCustomPointsError] = useState("");

  // Set default start date to today and handle query params
  useEffect(() => {
    const today = new Date();
    setStartDate(today.toISOString().split("T")[0]);

    // Set league ID from query params or active league
    const leagueIdFromQuery = searchParams.get("leagueId");
    if (leagueIdFromQuery) {
      setLeagueId(leagueIdFromQuery);
    } else if (activeLeague) {
      setLeagueId(activeLeague.id);
    }

    // Set season ID from query params or active season
    const seasonIdFromQuery = searchParams.get("seasonId");
    if (seasonIdFromQuery) {
      setSeasonId(seasonIdFromQuery);
    } else if (activeSeason) {
      setSeasonId(activeSeason.id);
    }
  }, [searchParams, activeLeague, activeSeason]);

  // Filter seasons when league changes
  useEffect(() => {
    if (leagueId) {
      setFilteredSeasons(
        MOCK_SEASONS.filter((season) => season.leagueId === leagueId)
      );
    } else {
      setFilteredSeasons(MOCK_SEASONS);
    }
  }, [leagueId]);

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setNameError("");
    setLeagueError("");
    setSeasonError("");
    setStartDateError("");
    setCustomPointsError("");

    // Validate name
    if (!name.trim()) {
      setNameError("Series name is required");
      isValid = false;
    }

    // Validate league
    if (!leagueId) {
      setLeagueError("Please select a league");
      isValid = false;
    }

    // Validate season
    if (!seasonId) {
      setSeasonError("Please select a season");
      isValid = false;
    }

    // Validate start date
    if (!startDate) {
      setStartDateError("Start date is required");
      isValid = false;
    }

    // Validate end date is after start date
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      setStartDateError("End date must be after start date");
      isValid = false;
    }

    // Validate custom points config
    if (pointsSystem === "custom") {
      try {
        if (!customPointsConfig.trim()) {
          setCustomPointsError("Custom points configuration is required");
          isValid = false;
        } else {
          JSON.parse(customPointsConfig);
        }
      } catch (err) {
        console.log(err)
        setCustomPointsError("Invalid JSON format");
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    const user = await getCurrentUser();

    setState("submitting");
    setError("");

    try {
      // This would be replaced with actual API call
      // Simulate API call
      await client.models.Series.create(
        {
          name,
          leagueId,
          seasonId,
          startDate,
          endDate: endDate || null,
          description,
          isActive,
          pointsSystem,
          customPointsConfig:
            pointsSystem === "custom" ? JSON.parse(customPointsConfig) : null,
          userId: user?.userId,
        },
        {
          authMode: "userPool",
        }
      );

      // Create series object
      const series = {
        name,
        leagueId,
        seasonId,
        startDate,
        endDate: endDate || null,
        description,
        isActive,
        pointsSystem,
        customPointsConfig:
          pointsSystem === "custom" ? JSON.parse(customPointsConfig) : null,
        // In a real app, userId would come from auth context
        userId: "current-user-id",
      };

      console.log("Creating series:", series);

      // For demo purposes, show success state
      setState("success");

      // After 1 second, redirect to series page
      setTimeout(() => {
        router.push("/series");
      }, 1000);
    } catch (err) {
      console.log(err)
      setState("error");
      setError(
        "An error occurred while creating the series. Please try again."
      );
    }
  };

  const breadcrumbItems = [
    { label: "Series", href: "/series" },
    { label: "Create Series" },
  ];

  return (
    <AppLayout
      title="Create Series"
      breadcrumbs={<Breadcrumb items={breadcrumbItems} />}
    >
      <div className="max-w-3xl mx-auto">
        {state === "error" && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        <div className="material-card">
          <div className="material-card-header">
            <h2 className="material-card-title flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Create New Series
            </h2>
            <p className="material-card-subtitle">
              Series group tournaments with a specific theme or format
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="material-card-content space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="league" className="material-label">
                  League*
                </label>
                <select
                  id="league"
                  value={leagueId}
                  onChange={(e) => {
                    setLeagueId(e.target.value);
                    setSeasonId(""); // Reset season when league changes
                  }}
                  className={`material-input ${leagueError ? "border-destructive" : ""}`}
                  disabled={state === "submitting" || !!activeLeague}
                >
                  <option value="">Select a league</option>
                  {MOCK_LEAGUES.map((league) => (
                    <option key={league.id} value={league.id}>
                      {league.name}
                    </option>
                  ))}
                </select>
                {leagueError && (
                  <p className="text-destructive text-xs mt-1">{leagueError}</p>
                )}
              </div>

              <div>
                <label htmlFor="season" className="material-label">
                  Season*
                </label>
                <select
                  id="season"
                  value={seasonId}
                  onChange={(e) => setSeasonId(e.target.value)}
                  className={`material-input ${seasonError ? "border-destructive" : ""}`}
                  disabled={
                    state === "submitting" || !leagueId || !!activeSeason
                  }
                >
                  <option value="">Select a season</option>
                  {filteredSeasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      {season.name}
                    </option>
                  ))}
                </select>
                {seasonError && (
                  <p className="text-destructive text-xs mt-1">{seasonError}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="material-label">
                Series Name*
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`material-input ${nameError ? "border-destructive" : ""}`}
                placeholder="e.g., Beginner Series"
                disabled={state === "submitting"}
              />
              {nameError && (
                <p className="text-destructive text-xs mt-1">{nameError}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="material-label">
                  Start Date*
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`material-input ${startDateError ? "border-destructive" : ""}`}
                  disabled={state === "submitting"}
                />
                {startDateError && (
                  <p className="text-destructive text-xs mt-1">
                    {startDateError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="material-label">
                  End Date (Optional)
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="material-input"
                  disabled={state === "submitting"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank for ongoing series
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="material-label">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="material-input min-h-[100px]"
                placeholder="Describe this series..."
                disabled={state === "submitting"}
              />
            </div>

            <div>
              <label
                htmlFor="pointsSystem"
                className="material-label flex items-center gap-2"
              >
                Points System
                <div className="relative group">
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  <div className="absolute left-full ml-2 top-0 w-64 p-2 bg-white border border-border rounded shadow-md hidden group-hover:block z-10 text-xs">
                    <p>
                      <strong>Standard:</strong> 1st: 100pts, 2nd: 90pts,
                      decreasing by 10 for each position
                    </p>
                    <p>
                      <strong>Weighted:</strong> Points based on tournament size
                      and buy-in
                    </p>
                    <p>
                      <strong>Custom:</strong> Define your own points structure
                    </p>
                  </div>
                </div>
              </label>
              <select
                id="pointsSystem"
                value={pointsSystem}
                onChange={(e) =>
                  setPointsSystem(e.target.value as PointsSystem)
                }
                className="material-input"
                disabled={state === "submitting"}
              >
                <option value="standard">Standard</option>
                <option value="weighted">Weighted</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {pointsSystem === "custom" && (
              <div>
                <label htmlFor="customPointsConfig" className="material-label">
                  Custom Points Configuration (JSON)
                </label>
                <textarea
                  id="customPointsConfig"
                  value={customPointsConfig}
                  onChange={(e) => setCustomPointsConfig(e.target.value)}
                  className={`material-input min-h-[100px] font-mono text-sm ${customPointsError ? "border-destructive" : ""}`}
                  placeholder='{"1": 100, "2": 90, "3": 80, "4": 70, "5": 60}'
                  disabled={state === "submitting"}
                />
                {customPointsError && (
                  <p className="text-destructive text-xs mt-1">
                    {customPointsError}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a JSON object with position numbers as keys and point
                  values as values
                </p>
              </div>
            )}

            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                disabled={state === "submitting"}
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm text-foreground"
              >
                Series is active
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/series")}
                className="material-button-secondary"
                disabled={state === "submitting"}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="material-button-primary bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                disabled={state === "submitting"}
              >
                {state === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Series"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
