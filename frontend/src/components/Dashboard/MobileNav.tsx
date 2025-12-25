'use client'

import React from "react";
import { List, Home, Key, Library, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { NavLink } from "@/components/Dashboard/NavLink";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function MobileNav() {
  return (
    <Sheet>
      <div className="flex md:hidden items-center gap-4 border-b bg-background p-4 justify-between">
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="flex md:hidden">
            <List className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>

        <div className="flex items-center gap-2">
          <img 
            src="/logo.svg" 
            alt="PortSmith Logo" 
            className="w-7 h-7"
          />
          <span className="font-semibold">PortSmith</span>
        </div>

        <MobileUserMenu />
      </div>

      <SheetContent side="left" className="w-[240px] sm:w-[280px] p-0">
        <div className="px-2 py-4 flex items-center gap-2 border-b">
          <img 
            src="/logo.svg" 
            alt="PortSmith Logo" 
            className="w-7 h-7 ml-2"
          />
          <span className="font-semibold">PortSmith</span>
        </div>

        <ScrollArea className="h-[calc(100vh-60px)]">
          <div className="px-1 py-3">
            <nav className="flex flex-col gap-1 px-2">
              <NavLink
                href="/dashboard"
                icon={<Home className="mr-3 h-4 w-4" />}
                label="Dashboard"
                mobile
              />
              <NavLink
                href="/dashboard/my-keys"
                icon={<Key className="mr-3 h-4 w-4" />}
                label="My API Keys"
                mobile
              />
              <NavLink
                href="/dashboard/available-apis"
                icon={<Library className="mr-3 h-4 w-4" />}
                label="Available APIs"
                badge={{
                  text: "New",
                  variant: "default",
                }}
                mobile
              />

              <Separator className="my-4" />

              <NavLink
                href="/dashboard/settings"
                icon={<Settings className="mr-3 h-4 w-4" />}
                label="Account Settings"
                mobile
              />
            </nav>

            <div className="mt-6 px-3">
              <ModeToggle />
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function MobileUserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={logout}
        className="h-8 w-8"
        title="Logout"
      >
        <LogOut className="h-4 w-4" />
      </Button>
      <Avatar className="h-8 w-8">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </div>
  );
}
