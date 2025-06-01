"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Loader2, AlertCircle } from "lucide-react";
import { signIn } from "aws-amplify/auth";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { createSession, error: authError, isLoading, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/results");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Sign in with AWS Amplify
      await signIn({ username: email, password });
      
      // Establish session in auth context
      await createSession();

      // Navigate to dashboard
      router.push("/results");
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Provide more specific error messages based on the error type
      if (err.name === "UserNotConfirmedException") {
        setError("Please verify your email before logging in");
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      } else if (err.name === "NotAuthorizedException") {
        setError("Incorrect username or password");
      } else if (err.name === "UserNotFoundException") {
        setError("User does not exist");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
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
          Poker League Management
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          Sign in to your account
        </p>

        {(error || authError) && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error || authError}
          </div>
        )}

        <form onSubmit={handleLogin}>
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
                className="material-input"
                placeholder="admin@example.com"
                required
                disabled={isLoading || isSubmitting}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="material-label">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="material-input"
                required
                disabled={isLoading || isSubmitting}
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-200 text-primary focus:ring-primary"
                disabled={isLoading || isSubmitting}
              />
              <label
                htmlFor="remember"
                className="ml-2 text-sm text-foreground"
              >
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="material-button-primary bg-blue-600 text-white hover:bg-blue-700 w-full flex items-center justify-center gap-2"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>

            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-primary hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
