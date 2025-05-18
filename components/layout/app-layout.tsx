"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, ChevronLeft, Trophy, Calendar, Users, BarChart2, LogOut, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { HierarchyHeader } from "./hierarchy-header"
import { signOut } from "aws-amplify/auth"

interface AppLayoutProps {
  children: React.ReactNode
  userRole?: "admin" | "organizer"
  breadcrumbs?: React.ReactNode
  title?: string // Make title optional
}

export function AppLayout({
  children,
  userRole = "admin",
  breadcrumbs,
  title: propTitle, // Rename to propTitle to avoid conflicts
}: AppLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Default to closed on mobile, open on desktop
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Generate title based on the current route
  const getRouteTitle = () => {
    // Remove leading slash and get the first segment of the path
    const path = pathname.split("/")[1]

    // Handle empty path (root route)
    if (!path) return "Dashboard"

    // Handle create and detail pages
    if (pathname.includes("/create")) {
      return `Create ${path.charAt(0).toUpperCase() + path.slice(1, -1)}`
    }

    // Check if it's a detail page (has an ID segment)
    const segments = pathname.split("/")
    if (segments.length > 2 && segments[2] !== "create") {
      return `${path.charAt(0).toUpperCase() + path.slice(1, -1)} Details`
    }

    // Default case: capitalize the path
    return `${path.charAt(0).toUpperCase() + path.slice(1)} Dashboard`
  }

  // Use prop title if provided, otherwise generate from route
  const title = propTitle || getRouteTitle()

  // Check screen size on mount and window resize
  useEffect(() => {
    const checkScreenSize = () => {
      setDrawerOpen(window.innerWidth >= 768) // 768px is typical md breakpoint
    }

    // Set initial state
    checkScreenSize()

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Find the navItems array and update it to match the new sidebar structure
  const navItems = [
    {
      name: "Results",
      href: "/results",
      icon: Trophy,
      roles: ["admin", "organizer"],
    },
    {
      name: "Standings",
      href: "/standings",
      icon: BarChart2,
      roles: ["admin", "organizer"],
    },
    {
      name: "Season Event",
      href: "/qualification",
      icon: Calendar,
      roles: ["admin", "organizer"],
    },
  ]

  const settingsItems = [
    {
      name: "Leagues",
      href: "/leagues",
      icon: Trophy,
      roles: ["admin", "organizer"],
    },
    {
      name: "Seasons",
      href: "/seasons",
      icon: Calendar,
      roles: ["admin", "organizer"],
    },
    {
      name: "Series",
      href: "/series",
      icon: Calendar,
      roles: ["admin", "organizer"],
    },
    {
      name: "Players",
      href: "/players",
      icon: Users,
      roles: ["admin", "organizer"],
    },
  ]

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole))

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/login")
  }

  const handleNavigation = () => {
    // Close drawer on mobile when navigation occurs
    if (window.innerWidth < 768) {
      setDrawerOpen(false)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 material-app-bar flex items-center justify-between px-4">
          <h1 className="text-xl font-medium">Poker League</h1>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1 rounded-full hover:bg-primary/80 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>
        <div className="p-2 flex flex-col justify-between pb-20 h-full">
          <div className="space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn("material-drawer-item", pathname === item.href && "active")}
                onClick={handleNavigation}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Settings dropdown */}
            <div className="mt-4">
              <button
                className={cn(
                  "material-drawer-item w-full text-left flex justify-between",
                  settingsOpen && "bg-secondary",
                )}
                onClick={() => setSettingsOpen(!settingsOpen)}
              >
                <div className="flex items-center">
                  <Settings className="h-5 w-5" />
                  <span className="ml-3">Settings</span>
                </div>
                <ChevronLeft
                  className={cn("h-5 w-5 transition-transform", settingsOpen ? "rotate-90" : "-rotate-90")}
                />
              </button>

              {settingsOpen && (
                <div className="pl-4 space-y-1 mt-1">
                  {settingsItems
                    .filter((item) => item.roles.includes(userRole))
                    .map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn("material-drawer-item", pathname === item.href && "active")}
                        onClick={handleNavigation}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          </div>
          <button onClick={handleLogout} className="material-drawer-item w-full text-left">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn("flex-1 flex flex-col transition-all duration-300 ease-in-out", drawerOpen ? "ml-64" : "ml-0")}
      >
        <header className="material-app-bar sticky top-0 z-40">
          {!drawerOpen && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="mr-4 p-1 rounded-full hover:bg-primary/80 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-xl font-medium">{title}</h1>
        </header>

        <HierarchyHeader />

        <main className="flex-1 overflow-auto p-1 md:p-6">
          {breadcrumbs}
          {children}
        </main>
      </div>
    </div>
  )
}
