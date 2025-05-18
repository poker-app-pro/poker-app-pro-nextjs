"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"

interface Player {
  id: string
  name: string
  isNew?: boolean
}

interface PlayerAutoSuggestProps {
  onSelect: (player: Player) => void
  existingPlayers: Player[]
  placeholder?: string
  helperText?: string
}

export function PlayerAutoSuggest({
  onSelect,
  existingPlayers,
  placeholder = "Search players...",
  helperText,
}: PlayerAutoSuggestProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter players based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPlayers([])
      return
    }

    const searchTermLower = searchTerm.toLowerCase()
    const filtered = existingPlayers.filter((player) => player.name.toLowerCase().includes(searchTermLower))

    // Check if we need to add a "Create new player" option
    const exactMatch = existingPlayers.some((player) => player.name.toLowerCase() === searchTermLower)

    if (!exactMatch && searchTerm.trim().length >= 2) {
      filtered.push({
        id: `new-${Date.now()}`,
        name: searchTerm.trim(),
        isNew: true,
      })
    }

    setFilteredPlayers(filtered)
  }, [searchTerm, existingPlayers])

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
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {helperText && <p className="text-xs text-muted-foreground mt-1">{helperText}</p>}

      {isDropdownOpen && filteredPlayers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${index === selectedIndex ? "bg-gray-100" : ""}`}
              onClick={() => handleSelectPlayer(player)}
            >
              {player.isNew ? (
                <div className="flex items-center justify-between">
                  <span>
                    Create new player: <strong>{player.name}</strong>
                  </span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">New</span>
                </div>
              ) : (
                player.name
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
