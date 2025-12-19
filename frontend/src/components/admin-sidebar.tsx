"use client"

import Link from "next/link"
import { LayoutDashboard, Users, BarChart3, Key, Menu, LogOut, ArrowLeft } from "lucide-react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { useMobile } from "@/hooks/use-mobile"

const sidebarItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "API Keys",
    href: "/admin/api-keys",
    icon: Key,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Manage APIs",
    href: "/admin/manage-apis",
    icon: LayoutDashboard,
  },
]

export default function AdminSidebar() {
  const isMobile = useMobile()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const initials = user?.full_name ? getInitials(user.full_name) : user?.email?.[0]?.toUpperCase() || 'A';

  const SidebarContent = (
    <>
      <div className="p-4 flex items-center gap-2 border-b">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground">PS</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-lg">PortSmith</span>
          <span className="text-xs text-muted-foreground">Admin Panel</span>
        </div>
      </div>
      
      <ScrollArea className="flex-grow px-3 py-4">
        <nav className="flex flex-col gap-1">
          <div className="mb-1 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Navigation
          </div>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
          
          <div className="my-4 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Actions
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/dashboard">
              <ArrowLeft className="mr-3 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={logout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-sm flex-1">
            <span className="font-medium truncate">{user?.full_name}</span>
            <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
          </div>
          <ModeToggle />
        </div>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <aside className="flex h-full flex-col bg-background">
            {SidebarContent}
          </aside>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside className="hidden md:flex md:w-64 h-screen flex-col bg-background border-r shadow-sm">
      {SidebarContent}
    </aside>
  )
}
