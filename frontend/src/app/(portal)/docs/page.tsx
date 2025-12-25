"use client";

import Head from "next/head";
import Link from "next/link";
import ScrollNavbar from "@/components/scroll-navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book, ArrowRight, ExternalLink, Sparkles, FileCode } from "lucide-react";
import { useApiData } from "@/hooks/use-api-data";

interface Api {
  id: string;
  name: string;
  slug: string;
  description: string;
  category?: string;
  icon?: string;
  color?: string;
  mode: 'openapi' | 'markdown';
}

export default function DocsPage() {
  const { data: apisData, isLoading, error } = useApiData<{ apis: Api[] }>({
    endpoint: '/api/apis',
    fallbackData: { apis: [] },
  });

  const publicApis = apisData?.apis?.filter((api) => api) || [];

  // Group APIs by category
  const groupedApis = publicApis.reduce((acc, api) => {
    const category = api.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(api);
    return acc;
  }, {} as Record<string, Api[]>);

  return (
    <>
      <ScrollNavbar />
      <Head>
        <title>API Documentation - PortSmith</title>
        <meta name="description" content="Comprehensive API documentation for PortSmith Gateway." />
        <meta property="og:title" content="API Documentation - PortSmith" />
        <meta property="og:description" content="Comprehensive API documentation for PortSmith Gateway." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://portsmith.dev/docs" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      
      <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-background via-background to-muted/10">
        <div className="container max-w-7xl">
          {/* Hero Header */}
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Interactive Documentation</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              API Documentation
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore our collection of APIs with interactive Swagger UI and detailed guides
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="py-12 text-center">
                <p className="text-destructive font-medium">Failed to load APIs</p>
                <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
              </CardContent>
            </Card>
          )}

          {/* APIs by Category */}
          {!isLoading && !error && Object.keys(groupedApis).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No APIs available yet</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && Object.entries(groupedApis).map(([category, apis]) => (
            <div key={category} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold">{category}</h2>
                <Badge variant="secondary">{apis.length}</Badge>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apis.map((api) => (
                  <Link key={api.id} href={`/docs/${api.slug}`}>
                    <Card className="h-full group hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {api.icon && (
                              <div 
                                className="text-3xl p-2 rounded-lg"
                                style={{ 
                                  backgroundColor: `${api.color}15`,
                                  color: api.color || '#3B82F6'
                                }}
                              >
                                {api.icon}
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {api.name}
                              </CardTitle>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {api.mode === 'openapi' ? 'Interactive' : 'Markdown'}
                              </Badge>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                          {api.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Book className="h-4 w-4" />
                          <span>View Documentation</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Footer />
    </>
  );
}
