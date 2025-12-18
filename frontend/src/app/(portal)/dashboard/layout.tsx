'use client'

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { MobileNav } from "@/components/Dashboard/MobileNav";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Protect the route - redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirectTo=/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col md:flex-row bg-muted/30">
      <Sidebar />
      <MobileNav />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto scrollbar-thin p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
