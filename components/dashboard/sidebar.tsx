"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Trophy, Users, Calendar, Settings, LogOut, ChevronDown, BarChart2, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"

interface SidebarProps {
  userRole: "admin" | "organizer"
  onNavigate?: () => void
}

export function Sidebar({ userRole, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="h-screen w-64 border-r bg-card flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Poker League</h2>
        <p className="text-sm text-muted-foreground capitalize">{userRole}</p>
      </div>
      <div className="flex-1 px-3 py-2 space-y-1">
        {/* Main menu items */}
        <Link href="/results" passHref>
          <Button
            variant="ghost"
            className={cn("w-full justify-start", pathname === "/results" && "bg-secondary")}
            onClick={onNavigate}
          >
            <Trophy className="mr-2 h-4 w-4" />
            Tournaments
          </Button>
        </Link>

        <Link href="/standings" passHref>
          <Button
            variant="ghost"
            className={cn("w-full justify-start", pathname === "/standings" && "bg-secondary")}
            onClick={onNavigate}
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Standings
          </Button>
        </Link>

        <Link href="/qualification" passHref>
          <Button
            variant="ghost"
            className={cn("w-full justify-start", pathname === "/qualification" && "bg-secondary")}
            onClick={onNavigate}
          >
            <Award className="mr-2 h-4 w-4" />
            Season Event
          </Button>
        </Link>

        {/* Settings section */}
        <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen} className="mt-4">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn("w-full justify-between", pathname.includes("/settings") && "bg-secondary")}
              onClick={onNavigate}
            >
              <span className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", settingsOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-1">
            <Link href="/dashboard" passHref>
              <Button
                variant="ghost"
                className={cn("w-full justify-start", pathname === "/dashboard" && "bg-secondary")}
                onClick={onNavigate}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>

            <Link href="/leagues" passHref>
              <Button
                variant="ghost"
                className={cn("w-full justify-start", pathname === "/leagues" && "bg-secondary")}
                onClick={onNavigate}
              >
                <Trophy className="mr-2 h-4 w-4" />
                Leagues
              </Button>
            </Link>

            <Link href="/seasons" passHref>
              <Button
                variant="ghost"
                className={cn("w-full justify-start", pathname === "/seasons" && "bg-secondary")}
                onClick={onNavigate}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Seasons
              </Button>
            </Link>

            <Link href="/series" passHref>
              <Button
                variant="ghost"
                className={cn("w-full justify-start", pathname === "/series" && "bg-secondary")}
                onClick={onNavigate}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Series
              </Button>
            </Link>

            <Link href="/players" passHref>
              <Button
                variant="ghost"
                className={cn("w-full justify-start", pathname === "/players" && "bg-secondary")}
                onClick={onNavigate}
              >
                <Users className="mr-2 h-4 w-4" />
                Players
              </Button>
            </Link>

            <Link href="/results" passHref>
              <Button
                variant="ghost"
                className={cn("w-full justify-start", pathname === "/results" && "bg-secondary")}
                onClick={onNavigate}
              >
                <Trophy className="mr-2 h-4 w-4" />
                Results
              </Button>
            </Link>
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={onNavigate}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
