"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowRight,
  Code,
  Database,
  Zap,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useApiData } from "../hooks/use-api-data";

// Define a type for the API data
type Api = {
  id: string;
  name: string;
  slug: string;
  description: string;
  documentation: string;
};

// Map for the icons
const iconMap = {
  Authentication: Code,
  Database: Database,
  Analytics: Zap,
  // Default icon if none matches
  Default: FileText,
};
function Featured() {
  const { isAuthenticated } = useAuth();
  const isSignedIn = isAuthenticated;
  const router = useRouter();
  
  // Fetch all APIs and filter for featured ones
  const { data, isLoading, error } = useApiData<{ apis: Api[] }>({
    endpoint: "/api/apis",
    fallbackData: { apis: [] },
  });

  // Filter for featured APIs
  // Filter for featured APIs
  const featuredApis = data?.apis?.filter((api: any) => api.featured === true) || [];

  return (
    <section className="py-16 px-4 container max-w-6xl">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-3 px-3 py-1 text-sm">
            Featured
          </Badge>
          <h2 className="text-3xl font-bold">Popular APIs</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Explore our most popular developer tools to power your next project
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-destructive/5 rounded-lg p-6 max-w-lg mx-auto">
            <p className="font-medium">Failed to load APIs</p>
            <p className="text-sm mt-2">
              Please try again later or contact support
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredApis.map((api: { name: string; id: any; description: string; slug: string; documentation?: string; }) => {
                // Determine which icon to use
                const IconComponent = api.name.includes("Authentication")
                  ? iconMap["Authentication"]
                  : api.name.includes("Database")
                  ? iconMap["Database"]
                  : api.name.includes("Analytics")
                  ? iconMap["Analytics"]
                  : iconMap["Default"];

                return (
                  <Card
                    key={api.id}
                    className="card-hover-effect border-t-4 border-t-primary/80 overflow-hidden"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-md bg-primary/10">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{api.name}</CardTitle>
                      </div>
                      <CardDescription className="text-base">
                        {api.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex gap-3 pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 btn-transition"
                        asChild
                      >
                        <Link href={`/docs/${api.slug}`}>
                          View Documentation <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            <div className="flex justify-center mt-12">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 btn-transition"
                asChild
              >
                <Link href="/docs" className="flex items-center gap-2">
                  View All APIs <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </section>
    );
  }

export default Featured;
