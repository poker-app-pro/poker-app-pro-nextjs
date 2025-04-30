"use client";

import type React from "react";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trophy, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { confirmResetPassword } from "aws-amplify/auth";

type ResetPasswordState = "idle" | "submitting" | "success" | "error";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [state, setState] = useState<ResetPasswordState>("idle");
  const [error, setError] = useState("");

  // Form fields
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation errors
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setCodeError("");
    setPasswordError("");
    setConfirmPasswordError("");

    // Validate verification code
    if (!verificationCode) {
      setCodeError("Verification code is required");
      isValid = false;
    } else if (
      verificationCode.length !== 6 ||
      !/^\d+$/.test(verificationCode)
    ) {
      setCodeError("Please enter a valid 6-digit verification code");
      isValid = false;
    }

    // Validate password
    if (!newPassword) {
      setPasswordError("New password is required");
      isValid = false;
    } else if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      isValid = false;
    }

    // Validate confirm password
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
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
      // This would be replaced with actual Amplify reset password
      // Simulate API call
      await confirmResetPassword({
        username: email,
        confirmationCode: verificationCode,
        newPassword,
      });

      // For demo purposes, show success state
      setState("success");

      // After 2 seconds, redirect to login
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      console.log(err)
      setState("error");
      setError("Failed to reset password. Please try again.");
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
          Enter the verification code sent to {email || "your email"} and your
          new password
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
            <h2 className="font-medium text-lg mb-1">
              Password Reset Successfully!
            </h2>
            <p className="text-sm mb-4">
              You can now log in with your new password.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="verificationCode" className="material-label">
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className={`material-input ${codeError ? "border-destructive" : ""}`}
                  placeholder="123456"
                  maxLength={6}
                  disabled={state === "submitting"}
                />
                {codeError && (
                  <p className="text-destructive text-xs mt-1">{codeError}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="material-label">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`material-input ${passwordError ? "border-destructive" : ""}`}
                  disabled={state === "submitting"}
                />
                {passwordError && (
                  <p className="text-destructive text-xs mt-1">
                    {passwordError}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="material-label">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`material-input ${confirmPasswordError ? "border-destructive" : ""}`}
                  disabled={state === "submitting"}
                />
                {confirmPasswordError && (
                  <p className="text-destructive text-xs mt-1">
                    {confirmPasswordError}
                  </p>
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
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>

              <div className="text-center text-sm">
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
