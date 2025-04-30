"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  ChevronLeft,
  Trophy,
  Calendar,
  Users,
  BarChart2,
  LogOut,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HierarchyHeader } from "./hierarchy-header";
import { signOut } from "aws-amplify/auth";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  userRole?: "admin" | "organizer";
  breadcrumbs?: React.ReactNode;
}

export function AppLayout({
  children,
  title,
  userRole = "admin",
  breadcrumbs,
}: AppLayoutProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const router = useRouter();
  const navItems = [
    {
      name: "Leagues Dashboard",
      href: "/",
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
      icon: Star,
      roles: ["admin", "organizer"],
    },
    {
      name: "Tournaments",
      href: "/tournaments",
      icon: Trophy,
      roles: ["admin", "organizer"],
    },
    {
      name: "Players",
      href: "/players",
      icon: Users,
      roles: ["admin", "organizer"],
    },
    {
      name: "Scoreboards",
      href: "/scoreboards",
      icon: BarChart2,
      roles: ["admin", "organizer"],
    },
    {
      name: "Main Event Qualification",
      href: "/qualification",
      icon: Star,
      roles: ["admin", "organizer"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div className="flex h-screen ">
      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
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
          <div className="material-divider">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "material-drawer-item",
                  pathname === item.href && "active"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="material-drawer-item w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          drawerOpen ? "ml-64" : "ml-0"
        )}
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

        <main className="flex-1 overflow-auto p-6">
          {breadcrumbs}
          {children}
        </main>
      </div>
    </div>
  );
}
