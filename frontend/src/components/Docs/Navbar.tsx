"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { Book, Menu, ArrowRight, ChevronRight, Home, Library, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const navItems = [
  {
    name: "Documentation",
    href: "/docs",
  },
  {
    name: "APIs",
    href: "/dashboard/available-apis",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Pricing",
    href: "/pricing",
  },
];

export default function DocsNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">API</span>
            </div>
            <span className="font-medium">DevChi</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 ml-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors hover:text-primary relative py-2",
                  "text-muted-foreground"
                )}
              >
                {item.name}
                {item.name === "APIs" && (
                  <Badge variant="outline" className="ml-2 py-0 text-[10px]">
                    New
                  </Badge>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search docs..." className="pl-8 w-[200px] bg-background" />
          </div>
          
          <ModeToggle />
          
          {isSignedIn ? (
            <UserMenuButton />
          ) : (
            <Button size="sm" className="hidden md:inline-flex" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-6 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">API</span>
                  </div>
                  <span className="font-medium">DevChi</span>
                </div>

                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search..." className="pl-8 w-full bg-background" />
                </div>

                <div>
                  <h2 className="text-lg font-medium border-b pb-2 mb-2">
                    Navigation
                  </h2>
                  <nav className="flex flex-col gap-2">
                    <Link href="/" className="flex items-center py-2 px-3 text-sm rounded-md transition-colors hover:bg-accent text-foreground">
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </Link>
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "py-2 px-3 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground flex items-center justify-between",
                          "text-muted-foreground"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>{item.name}</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ))}
                  </nav>
                </div>
                
                {!isSignedIn && (
                  <div className="mt-auto pt-6 border-t flex flex-col gap-2">
                    <Button className="w-full" asChild>
                      <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                        Create Account
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function UserMenuButton() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
  );
}
