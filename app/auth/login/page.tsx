"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Loader2, AlertCircle } from "lucide-react";
import { signIn } from "aws-amplify/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // This would be replaced with actual Amplify authentication
    try {
      // Simulate API call
      await signIn({ username: email, password });

      // For demo purposes, navigate to dashboard
      router.push("/");
    } catch (err) {
      console.log(err)
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
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

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                disabled={isLoading}
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
              disabled={isLoading}
            >
              {isLoading ? (
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
