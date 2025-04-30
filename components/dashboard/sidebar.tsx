"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Trophy, Users, Calendar, Settings, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"

interface SidebarProps {
  userRole: "admin" | "organizer"
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const [leaguesOpen, setLeaguesOpen] = useState(true)

  return (
    <div className="h-screen w-64 border-r border-gray-200 dark:border-gray-700  bg-card flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Poker League</h2>
        <p className="text-sm text-muted-foreground capitalize">{userRole}</p>
      </div>
      <div className="flex-1 px-3 py-2 space-y-1">
        <Link href="/dashboard" passHref>
          <Button variant="ghost" className={cn("w-full justify-start", pathname === "/dashboard" && "bg-secondary")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>

        <Collapsible open={leaguesOpen} onOpenChange={setLeaguesOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn("w-full justify-between", pathname.includes("/leagues") && "bg-secondary")}
            >
              <span className="flex items-center">
                <Trophy className="mr-2 h-4 w-4" />
                Leagues
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", leaguesOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-1">
            <Link href="/leagues" passHref>
              <Button variant="ghost" className={cn("w-full justify-start", pathname === "/leagues" && "bg-secondary")}>
                All Leagues
              </Button>
            </Link>
            <Link href="/leagues/seasons" passHref>
              <Button
                variant="ghost"
                className={cn("w-full justify-start", pathname === "/leagues/seasons" && "bg-secondary")}
              >
                Seasons
              </Button>
            </Link>
            <Link href="/leagues/series" passHref>
              <Button
                variant="ghost"
                className={cn("w-full justify-start", pathname === "/leagues/series" && "bg-secondary")}
              >
                Series
              </Button>
            </Link>
            <Link href="/leagues/tournaments" passHref>
              <Button
                variant="ghost"
                className={cn("w-full justify-start", pathname === "/leagues/tournaments" && "bg-secondary")}
              >
                Tournaments
              </Button>
            </Link>
          </CollapsibleContent>
        </Collapsible>

        <Link href="/players" passHref>
          <Button variant="ghost" className={cn("w-full justify-start", pathname === "/players" && "bg-secondary")}>
            <Users className="mr-2 h-4 w-4" />
            Players
          </Button>
        </Link>

        <Link href="/events" passHref>
          <Button variant="ghost" className={cn("w-full justify-start", pathname === "/events" && "bg-secondary")}>
            <Calendar className="mr-2 h-4 w-4" />
            Events
          </Button>
        </Link>

        {userRole === "admin" && (
          <Link href="/settings" passHref>
            <Button variant="ghost" className={cn("w-full justify-start", pathname === "/settings" && "bg-secondary")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 ">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
