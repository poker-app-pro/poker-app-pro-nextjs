"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X, Loader2 } from "lucide-react"

interface Player {
  id: string
  name: string
  isNew?: boolean
}

interface PlayerAutoSuggestProps {
  onSelect: (player: Player) => void
  temporaryPlayers: Player[]
  excludePlayerIds?: string[]
  placeholder?: string
  helperText?: string
}

export function PlayerAutoSuggest({
  onSelect,
  temporaryPlayers,
  excludePlayerIds = [],
  placeholder = "Search players...",
  helperText,
}: PlayerAutoSuggestProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [apiPlayers, setApiPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounced API search function
  const searchPlayers = useCallback(async (term: string) => {
    if (term.length < 2) {
      setApiPlayers([])
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/players/search?q=${encodeURIComponent(term)}`)
      const data = await response.json()

      if (data.success) {
        setApiPlayers(data.players || [])
      } else {
        setError("Failed to search players")
        setApiPlayers([])
      }
    } catch (err) {
      console.error("Error searching players:", err)
      setError("Error searching players")
      setApiPlayers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce the search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPlayers(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, searchPlayers])

  // Combine and filter players based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPlayers([])
      return
    }

    const searchTermLower = searchTerm.toLowerCase()

    // Combine API players with temporary players
    const allPlayers = [...apiPlayers, ...temporaryPlayers]

    // Filter by search term and exclude specified player IDs
    const filtered = allPlayers.filter((player) => {
      const matchesSearch = player.name.toLowerCase().includes(searchTermLower)
      const notExcluded = !excludePlayerIds.includes(player.id)
      return matchesSearch && notExcluded
    })

    // Remove duplicates (in case a temporary player matches an API player)
    const uniqueFiltered = filtered.filter((player, index, arr) => 
      arr.findIndex(p => p.name.toLowerCase() === player.name.toLowerCase()) === index
    )

    // Check if we need to add a "Create new player" option
    const exactMatch = allPlayers.some((player) => player.name.toLowerCase() === searchTermLower)

    if (!exactMatch && searchTerm.trim().length >= 2) {
      uniqueFiltered.push({
        id: `new-${Date.now()}`,
        name: searchTerm.trim(),
        isNew: true,
      })
    }

    setFilteredPlayers(uniqueFiltered)
  }, [searchTerm, apiPlayers, temporaryPlayers, excludePlayerIds])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < filteredPlayers.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      handleSelectPlayer(filteredPlayers[selectedIndex])
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false)
    }
  }

  const handleSelectPlayer = (player: Player) => {
    onSelect(player)
    setSearchTerm("")
    setIsDropdownOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsDropdownOpen(true)
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          className="material-input pl-10 pr-8"
          placeholder={placeholder}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("")
              setApiPlayers([])
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {helperText && <p className="text-xs text-muted-foreground mt-1">{helperText}</p>}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      {isDropdownOpen && (filteredPlayers.length > 0 || isLoading) && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading && filteredPlayers.length === 0 && (
            <div className="px-4 py-2 text-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
              Searching players...
            </div>
          )}
          {filteredPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${index === selectedIndex ? "bg-gray-100" : ""}`}
              onClick={() => handleSelectPlayer(player)}
            >
              {player.isNew ? (
                <div className="flex items-center justify-between">
                  <span>
                    <strong>{player.name}</strong>
                  </span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">New</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span>{player.name}</span>
                  {temporaryPlayers.some(tp => tp.id === player.id) && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">Temp</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
