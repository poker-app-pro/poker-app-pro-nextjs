"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Trophy, Loader2, AlertCircle, ImageIcon } from "lucide-react";
import { client } from "@/components/AmplifyClient";
import { getCurrentUser } from "aws-amplify/auth";

type FormState = "idle" | "submitting" | "success" | "error";

export default function CreateLeaguePage() {
  const router = useRouter();
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  // Validation errors
  const [nameError, setNameError] = useState("");

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setNameError("");

    // Validate name
    if (!name.trim()) {
      setNameError("League name is required");
      isValid = false;
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
      await client.models.League.create({
        name,
        description,
        isActive,
        imageUrl,
        userId: user.userId,
      }, {
        authMode: "userPool"
      });

      // For demo purposes, show success state
      setState("success");
 
        router.push("/leagues");
     } catch (err) {
      console.log(err)
      setState("error");
      setError(
        "An error occurred while creating the league. Please try again."
      );
    }
  };

  const breadcrumbItems = [
    { label: "Leagues", href: "/leagues" },
    { label: "Create League" },
  ];

  return (
    <AppLayout
      title="Create League"
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
              <Trophy className="h-5 w-5 text-primary" />
              Create New League
            </h2>
            <p className="material-card-subtitle">
              Leagues are the top-level organization for your poker tournaments
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="material-card-content space-y-6"
          >
            <div>
              <label htmlFor="name" className="material-label">
                League Name*
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`material-input ${nameError ? "border-destructive" : ""}`}
                placeholder="e.g., Texas Hold'em League"
                disabled={state === "submitting"}
              />
              {nameError && (
                <p className="text-destructive text-xs mt-1">{nameError}</p>
              )}
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
                placeholder="Describe your league..."
                disabled={state === "submitting"}
              />
            </div>

            <div>
              <label
                htmlFor="imageUrl"
                className="material-label flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                League Image URL
              </label>
              <input
                id="imageUrl"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="material-input"
                placeholder="https://example.com/image.jpg"
                disabled={state === "submitting"}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a URL for the league image (optional)
              </p>
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
                League is active
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/leagues")}
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
                  "Create League"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
