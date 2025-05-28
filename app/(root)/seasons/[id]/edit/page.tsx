"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Calendar, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getSeasonById, updateSeason } from "@/app/__actions/seasons";
import {
  FormSubmissionState,
  type FormSubmissionState as FormState,
} from "@/components/ui/form-submission-state";

export default function EditSeasonPage() {
  const params = useParams();
  const router = useRouter();
  const seasonId = params.id as string;

  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Form fields
  const [name, setName] = useState("");
  const [ , setLeagueId] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [season, setSeason] = useState<any | null>(null);

  // Validation errors
  const [nameError, setNameError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");

  // Fetch season data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch season data
        const seasonResult = await getSeasonById(seasonId);

        if (!seasonResult.success) {
          throw new Error(seasonResult.error || "Season not found");
        }

        const seasonData = seasonResult.data;
        setSeason(seasonData);

        // Set form fields
        setName(seasonData?.name || "");
        setLeagueId(seasonData?.leagueId || "");
        setLeagueName(seasonData?.leagueName || "Unknown League");
        setStartDate(
          seasonData?.startDate ? seasonData.startDate.split("T")[0] : ""
        );
        setEndDate(seasonData?.endDate ? seasonData.endDate.split("T")[0] : "");
        setDescription(seasonData?.description || "");
        setIsActive(
          seasonData?.isActive !== undefined
            ? (seasonData?.isActive as boolean)
            : true
        );
      } catch (error) {
        console.error("Error fetching season data:", error);
        setError("Failed to load season data");
      } finally {
        setIsLoading(false);
      }
    }

    if (seasonId) {
      fetchData();
    }
  }, [seasonId]);

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setNameError("");
    setStartDateError("");
    setEndDateError("");

    // Validate name
    if (!name.trim()) {
      setNameError("Season name is required");
      isValid = false;
    }

    // Validate start date
    if (!startDate) {
      setStartDateError("Start date is required");
      isValid = false;
    }

    // Validate end date is after start date (if provided)
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      setEndDateError("End date must be after start date");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setState("submitting");
    setError("");

    try {
      // Create form data
      const formData = new FormData();
      formData.append("name", name);
      formData.append("startDate", startDate);
      if (endDate) formData.append("endDate", endDate);
      if (description) formData.append("description", description);
      if (isActive) formData.append("isActive", "on");

      // Call server action
      const result = await updateSeason(seasonId, formData);

      if (result.success) {
        setState("success");

        // Redirect back to season details page
        setTimeout(() => {
          router.push(`/seasons/${seasonId}`);
        }, 1500);
      } else {
        throw new Error(result.error || "Failed to update season");
      }
    } catch (err) {
      console.error(err);
      setState("error");
      setError(
        "An error occurred while updating the season. Please try again."
      );
    }
  };

  const breadcrumbItems = [
    { label: "Seasons", href: "/seasons" },
    { label: season?.name || "Season Details", href: `/seasons/${seasonId}` },
    { label: "Edit" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="max-w-3xl mx-auto">
        {/* Form Submission State Overlay */}
        <FormSubmissionState
          state={state}
          title="Season"
          icon={<Calendar className="h-8 w-8 text-green-600" />}
          successTitle="Season Updated Successfully!"
          successMessage="Your season has been updated."
          errorMessage={error}
          redirectMessage="Redirecting to season details..."
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="material-card">
            <div className="material-card-header">
              <div className="flex items-center gap-2 mb-2">
                <Link href={`/seasons/${seasonId}`}>
                  <button className="material-button-secondary flex items-center gap-1 text-sm py-1">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                </Link>
              </div>
              <h2 className="material-card-title flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Edit Season
              </h2>
              <p className="material-card-subtitle">Update season details</p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="material-card-content space-y-6"
            >
              {state === "error" && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="material-label">
                  Season Name*
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`material-input ${nameError ? "border-destructive" : ""}`}
                  placeholder="e.g., Summer 2024"
                  disabled={state === "submitting"}
                />
                {nameError && (
                  <p className="text-destructive text-xs mt-1">{nameError}</p>
                )}
              </div>

              <div>
                <label htmlFor="league" className="material-label">
                  League
                </label>
                <input
                  type="text"
                  value={leagueName}
                  className="material-input"
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">
                  League cannot be changed
                </p>
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
                    className={`material-input ${endDateError ? "border-destructive" : ""}`}
                    disabled={state === "submitting"}
                  />
                  {endDateError ? (
                    <p className="text-destructive text-xs mt-1">
                      {endDateError}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave blank for ongoing season
                    </p>
                  )}
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
                  placeholder="Describe this season..."
                  disabled={state === "submitting"}
                />
              </div>

              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-200 text-primary focus:ring-primary"
                  disabled={state === "submitting"}
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-foreground"
                >
                  Season is active
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Link href={`/seasons/${seasonId}`}>
                  <button
                    type="button"
                    className="material-button-secondary"
                    disabled={state === "submitting"}
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  className="material-button-primary bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  disabled={state === "submitting"}
                >
                  {state === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Season"
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
