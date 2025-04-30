"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface League {
  id: string
  name: string
}

interface Season {
  id: string
  name: string
  leagueId: string
}

interface Series {
  id: string
  name: string
  seasonId: string
}

interface HierarchyContextType {
  activeLeague: League | null
  activeSeason: Season | null
  activeSeries: Series | null
  setActiveLeague: (league: League | null) => void
  setActiveSeason: (season: Season | null) => void
  setActiveSeries: (series: Series | null) => void
  clearHierarchy: () => void
}

const HierarchyContext = createContext<HierarchyContextType | undefined>(undefined)

export function HierarchyProvider({ children }: { children: React.ReactNode }) {
  const [activeLeague, setActiveLeague] = useState<League | null>(null)
  const [activeSeason, setActiveSeason] = useState<Season | null>(null)
  const [activeSeries, setActiveSeries] = useState<Series | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedLeague = localStorage.getItem("activeLeague")
      const storedSeason = localStorage.getItem("activeSeason")
      const storedSeries = localStorage.getItem("activeSeries")

      if (storedLeague) setActiveLeague(JSON.parse(storedLeague))
      if (storedSeason) setActiveSeason(JSON.parse(storedSeason))
      if (storedSeries) setActiveSeries(JSON.parse(storedSeries))
    } catch (error) {
      console.error("Error loading hierarchy from localStorage:", error)
    }
  }, [])

  // Save to localStorage when changed
  useEffect(() => {
    if (activeLeague) {
      localStorage.setItem("activeLeague", JSON.stringify(activeLeague))
    }
    if (activeSeason) {
      localStorage.setItem("activeSeason", JSON.stringify(activeSeason))
    }
    if (activeSeries) {
      localStorage.setItem("activeSeries", JSON.stringify(activeSeries))
    }
  }, [activeLeague, activeSeason, activeSeries])

  // Clear hierarchy when league changes
  useEffect(() => {
    if (!activeLeague) {
      setActiveSeason(null)
      setActiveSeries(null)
    }
  }, [activeLeague])

  // Clear series when season changes
  useEffect(() => {
    if (!activeSeason) {
      setActiveSeries(null)
    }
  }, [activeSeason])

  const clearHierarchy = () => {
    setActiveLeague(null)
    setActiveSeason(null)
    setActiveSeries(null)
    localStorage.removeItem("activeLeague")
    localStorage.removeItem("activeSeason")
    localStorage.removeItem("activeSeries")
  }

  return (
    <HierarchyContext.Provider
      value={{
        activeLeague,
        activeSeason,
        activeSeries,
        setActiveLeague,
        setActiveSeason,
        setActiveSeries,
        clearHierarchy,
      }}
    >
      {children}
    </HierarchyContext.Provider>
  )
}

export function useHierarchy() {
  const context = useContext(HierarchyContext)
  if (context === undefined) {
    throw new Error("useHierarchy must be used within a HierarchyProvider")
  }
  return context
}
