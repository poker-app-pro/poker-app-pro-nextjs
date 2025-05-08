"use client"

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
}

export function PlayerAutoSuggest({
  onSelect,
  existingPlayers,
  placeholder = "Search players...",
}: PlayerAutoSuggestProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim() === "") {
      setFilteredPlayers([])
      return
    }

    const lowerQuery = query.toLowerCase()
    const filtered = existingPlayers.filter((player) => player.name.toLowerCase().includes(lowerQuery)).slice(0, 5)

    // If no exact match and query is not empty, add option to create new player
    const exactMatch = filtered.some((p) => p.name.toLowerCase() === lowerQuery)
    if (!exactMatch && query.trim() !== "") {
      filtered.push({
        id: `new-${Date.now()}`,
        name: query,
        isNew: true,
      })
    }

    setFilteredPlayers(filtered)
  }, [query, existingPlayers])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (player: Player) => {
    onSelect(player)
    setQuery("")
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="material-input pl-10 pr-8"
          placeholder={placeholder}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {isOpen && filteredPlayers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="p-2 hover:bg-secondary cursor-pointer flex items-center justify-between"
              onClick={() => handleSelect(player)}
            >
              <span>{player.name}</span>
              {player.isNew && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">New Player</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
