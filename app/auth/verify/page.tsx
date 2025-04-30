"use client";

import type React from "react";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trophy, Loader2, CheckCircle, AlertCircle } from "lucide-react";

type VerifyState = "idle" | "submitting" | "success" | "error";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [state, setState] = useState<VerifyState>("idle");
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setCodeError("");

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

    return isValid;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setState("submitting");
    setError("");

    try {
      // This would be replaced with actual Amplify verification
      // Simulate API call
      await confirmSignUp({
        username: email,
        confirmationCode: verificationCode,
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
      setError("Invalid verification code. Please try again.");
    }
  };

  const handleResendCode = async () => {
    setError("");

    try {
      // This would be replaced with actual Amplify resend code
      // Simulate API call
      await resendSignUpCode({ username: email });

      // Show success message
      setError("A new verification code has been sent to your email.");
    } catch (err) {
      console.log(err)
      setError("Failed to resend verification code. Please try again.");
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
          Verify Your Email
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          We&apos;ve sent a verification code to {email || "your email"}
        </p>

        {error && (
          <div
            className={`p-3 rounded mb-4 text-sm flex items-center gap-2 ${
              error.includes("has been sent")
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {error.includes("has been sent") ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {error}
          </div>
        )}

        {state === "success" ? (
          <div className="bg-primary/10 text-primary p-4 rounded mb-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <h2 className="font-medium text-lg mb-1">
              Email Verified Successfully!
            </h2>
            <p className="text-sm mb-4">Your account is now active.</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerify}>
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

              <button
                type="submit"
                className="material-button-primary bg-blue-600 text-white hover:bg-blue-700 w-full flex items-center justify-center gap-2"
                disabled={state === "submitting"}
              >
                {state === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>

              <div className="text-center text-sm">
                Didn&apos;t receive a code?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-primary hover:underline"
                  disabled={state === "submitting"}
                >
                  Resend code
                </button>
              </div>

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
