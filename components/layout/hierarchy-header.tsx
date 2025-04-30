"use client"

import { useHierarchy } from "@/contexts/hierarchy-context"
import { ChevronDown } from "lucide-react"
import Link from "next/link"

export function HierarchyHeader() {
  const { activeLeague, activeSeason, activeSeries } = useHierarchy()

  return (
    <div className=" ">
      <div className="flex items-center gap-2 text-sm">
        {/* <div className="flex items-center">
          <span className="text-muted-foreground mr-1">League:</span>
          <Link href="/leagues" className="flex items-center hover:text-primary transition-colors">
            {activeLeague ? (
              <span className="font-medium">{activeLeague.name}</span>
            ) : (
              <span className="text-muted-foreground">Select League</span>
            )}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Link>
        </div> */}

        {activeLeague && (
          <>
            <span className="text-muted-foreground mx-1">•</span>
            <div className="flex items-center">
              <span className="text-muted-foreground mr-1">Season:</span>
              <Link
                href={`/leagues/${activeLeague.id}/seasons`}
                className="flex items-center hover:text-primary transition-colors"
              >
                {activeSeason ? (
                  <span className="font-medium">{activeSeason.name}</span>
                ) : (
                  <span className="text-muted-foreground">Select Season</span>
                )}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </>
        )}

        {activeSeason && (
          <>
            <span className="text-muted-foreground mx-1">•</span>
            <div className="flex items-center">
              <span className="text-muted-foreground mr-1">Series:</span>
              <Link
                href={`/leagues/${activeLeague?.id}/seasons/${activeSeason.id}/series`}
                className="flex items-center hover:text-primary transition-colors"
              >
                {activeSeries ? (
                  <span className="font-medium">{activeSeries.name}</span>
                ) : (
                  <span className="text-muted-foreground">Select Series</span>
                )}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
