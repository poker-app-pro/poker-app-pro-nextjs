"use client";

import { type ReactNode } from "react";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut, fetchAuthSession } from "aws-amplify/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  createSession: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check current auth state using Amplify's built-in session management
        await getCurrentUser();
        
        // Verify the session is valid
        const session = await fetchAuthSession();
        if (session.tokens) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.log("Not authenticated", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const createSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch the auth session to ensure it's properly established
      const session = await fetchAuthSession();
      if (!session.tokens) {
        throw new Error("Failed to establish session");
      }
      
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to establish session. Please try again.");
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      // Use Amplify's signOut to properly clear the session
      await signOut();
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
      value={{ isAuthenticated, isLoading, createSession, logout, error }}
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
