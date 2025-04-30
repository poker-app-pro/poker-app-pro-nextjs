"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { resetPassword } from "aws-amplify/auth";

type ForgotPasswordState = "idle" | "submitting" | "success" | "error";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [state, setState] = useState<ForgotPasswordState>("idle");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setEmailError("");

    // Validate email
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
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
      // This would be replaced with actual Amplify forgot password
      // Simulate API call
      await resetPassword({ username: email });

      // For demo purposes, show success state
      setState("success");

      // After 2 seconds, redirect to reset password page
      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      console.log(err)
      setState("error");
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
            <Trophy className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-medium text-center mb-1">
          Reset Your Password
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          Enter your email address and we&apos;ll send you a code to reset your
          password
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {state === "success" ? (
          <div className="bg-primary/10 text-primary p-4 rounded mb-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <h2 className="font-medium text-lg mb-1">Reset Code Sent!</h2>
            <p className="text-sm mb-4">
              We&apos;ve sent a password reset code to {email}. Please check your
              email.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to reset password page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="material-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`material-input ${emailError ? "border-destructive" : ""}`}
                  placeholder="john@example.com"
                  disabled={state === "submitting"}
                />
                {emailError && (
                  <p className="text-destructive text-xs mt-1">{emailError}</p>
                )}
              </div>

              <button
                type="submit"
                className="material-button-primary bg-blue-600 text-white hover:bg-blue-700 w-full flex items-center justify-center gap-2"
                disabled={state === "submitting"}
              >
                {state === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Reset Code...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </button>

              <div className="text-center text-sm">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary hover:underline"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
