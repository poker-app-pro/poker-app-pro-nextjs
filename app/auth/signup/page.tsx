"use client";

import type React from "react";

import { signUp } from "aws-amplify/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Loader2, CheckCircle, AlertCircle } from "lucide-react";

type SignupState = "idle" | "submitting" | "success" | "error";

export default function SignupPage() {
  const router = useRouter();
  const [state, setState] = useState<SignupState>("idle");
  const [error, setError] = useState("");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  // Validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [nameError, setNameError] = useState("");

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setNameError("");

    // Validate email
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    // Validate name
    if (!name) {
      setNameError("Name is required");
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      isValid = false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    return isValid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setState("submitting");
    setError("");

    try {
      // This would be replaced with actual Amplify authentication
      // Simulate API call
      await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            name: name,
          },
        },
      });

      // For demo purposes, show success state
      setState("success");
      router.push("/auth/verify?email=" + encodeURIComponent(email));
    } catch (err) {
      console.log(err)
      setState("error");
      setError("An error occurred during signup. Please try again.");
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
          Create Your Account
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          Join the Poker League Management system
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
              Account Created Successfully!
            </h2>
            <p className="text-sm mb-4">
              You can now log in with your credentials.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="material-label">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`material-input ${nameError ? "border-destructive" : ""}`}
                  placeholder="John Smith"
                  disabled={state === "submitting"}
                />
                {nameError && (
                  <p className="text-destructive text-xs mt-1">{nameError}</p>
                )}
              </div>

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

              <div>
                <label htmlFor="password" className="material-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Confirm Password
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

              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  required
                  disabled={state === "submitting"}
                />
                <label htmlFor="terms" className="ml-2 text-sm text-foreground">
                  I agree to the{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className="material-button-primary bg-blue-600 text-white hover:bg-blue-700 w-full flex items-center justify-center gap-2"
                disabled={state === "submitting"}
              >
                {state === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
