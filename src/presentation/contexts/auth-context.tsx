"use client";

import type React from "react";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut } from "aws-amplify/auth";

interface AuthContextType {
  createSession: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 24 hours in milliseconds
const SESSION_EXPIRY = 24 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setIsAuthenticated] = useState(false);
  const [ , setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if session is expired
        const expiryTime = localStorage.getItem("sessionExpiry");
        if (expiryTime && Number(expiryTime) < Date.now()) {
          // Session expired, log out
          await signOut();
          localStorage.removeItem("sessionExpiry");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Check current auth state
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Set up session expiry timer
  useEffect(() => {
    if (sessionExpiry) {
      const timeLeft = sessionExpiry - Date.now();

      if (timeLeft <= 0) {
        // Session already expired
        logout();
        return;
      }

      // Set timer to log out when session expires
      const timer = setTimeout(() => {
        logout();
      }, timeLeft);

      return () => clearTimeout(timer);
    }
  }, [sessionExpiry]);

  const createSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Set session expiry time (24 hours from now)
      const expiryTime = Date.now() + SESSION_EXPIRY;
      localStorage.setItem("sessionExpiry", expiryTime.toString());
      setSessionExpiry(expiryTime);

      setIsAuthenticated(true);
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password");
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      await signOut();
      localStorage.removeItem("sessionExpiry");
      setSessionExpiry(null);
      setIsAuthenticated(false);
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ createSession, logout, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
