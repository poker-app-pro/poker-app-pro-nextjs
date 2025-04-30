"use client"

import type React from "react"

import { Plus } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface FloatingActionButtonProps {
  actions: {
    label: string
    icon?: React.ReactNode
    href: string
    primary?: boolean
  }[]
}

export function FloatingActionButton({ actions }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-2 items-end mb-2">
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full shadow-lg w-44 transition-all transform",
                "animate-in fade-in slide-in-from-right duration-200",
                action.primary ? "bg-white text-foreground border border-gray-200" : "bg-white text-foreground border border-gray-200",
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setIsOpen(false)}
            >
              {action.icon}
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg flex items-center justify-center",
          "transition-transform duration-300",
          isOpen && "rotate-45",
        )}
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
