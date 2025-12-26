'use client'

import type { ReactNode } from "react"

import { ModeToggle } from "@/components/mode-toggle"
import AdminSidebar from "@/components/Admin/admin-sidebar"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-background md:hidden">
          <div className="flex h-16 items-center px-4 gap-4 justify-between">
            <AdminSidebar />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">PS</span>
              </div>
              <span className="font-semibold">PortSmith</span>
            </div>
            <ModeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
