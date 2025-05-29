"use client"

import { Home, Users, Trophy, Calendar, BarChart3, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/src/presentation/utils"

interface SidebarProps {
  userRole: "admin" | "organizer"
  onNavigate?: () => void
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Players", href: "/players", icon: Users },
  { name: "Leagues", href: "/leagues", icon: Trophy },
  { name: "Seasons", href: "/seasons", icon: Calendar },
  { name: "Series", href: "/series", icon: BarChart3 },
  { name: "Results", href: "/results", icon: Trophy },
  { name: "Standings", href: "/standings", icon: BarChart3 },
  { name: "Scoreboards", href: "/scoreboards", icon: BarChart3 },
]

const adminNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ userRole, onNavigate }: SidebarProps) {
  const pathname = usePathname()

  const allNavigation = userRole === "admin" 
    ? [...navigation, ...adminNavigation] 
    : navigation

  return (
    <div className="flex h-full w-64 flex-col bg-card">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold">Poker Pro</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {allNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
