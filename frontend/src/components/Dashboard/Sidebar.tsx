'use client'

import { Key, Library, Settings, Home, LogOut } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavLink } from "@/components/Dashboard/NavLink";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 h-screen flex-col bg-background border-r shadow-sm">
      <div className="p-4 flex items-center gap-2 border-b">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground">API</span>
        </div>
        <span className="font-semibold text-lg">DevChi</span>
      </div>
      
      <ScrollArea className="flex-grow px-3 py-4">
        <nav className="flex flex-col gap-1">
          <div className="mb-1 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Main
          </div>
          <NavLink 
            href="/dashboard" 
            icon={<Home className="mr-3 h-4 w-4" />}
            label="Dashboard"
          />
          <NavLink 
            href="/dashboard/my-keys" 
            icon={<Key className="mr-3 h-4 w-4" />}
            label="My API Keys"
          />
          <NavLink 
            href="/dashboard/available-apis" 
            icon={<Library className="mr-3 h-4 w-4" />}
            label="Available APIs"
            badge={{
              text: "New",
              variant: "default"
            }}
          />
          
          <div className="my-4 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Settings
          </div>
          <NavLink 
            href="/dashboard/settings" 
            icon={<Settings className="mr-3 h-4 w-4" />}
            label="Account Settings"
          />
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <UserMenu />
      </div>
    </aside>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="flex items-center gap-3 px-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex flex-col text-sm">
        <span className="font-medium">{user.firstName} {user.lastName}</span>
        <span className="text-xs text-muted-foreground">{user.role}</span>
      </div>
      <ModeToggle />
    </div>
  );
}
