"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";

export function DashboardHeader() {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="border-b bg-background p-4 hidden md:flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary/10">
          {user?.avatar_url && (
            <AvatarImage src={user.avatar_url} alt={user.full_name} />
          )}
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-medium">
            {user?.full_name ? getInitials(user.full_name) : "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">Developer Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Welcome back, {user?.full_name}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search APIs..."
            className="pl-8 w-[250px] bg-background"
          />
        </div>

        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </div>
  );
}
