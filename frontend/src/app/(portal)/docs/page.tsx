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

          {/* Getting Started Guide */}
          <Card className="mb-12 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Book className="h-6 w-6 text-primary" />
                Getting Started with API Keys
              </CardTitle>
              <CardDescription className="text-base">
                Follow these simple steps to integrate our APIs into your applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Introduction */}
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  PortSmith provides a unified API gateway that simplifies access to multiple APIs through a single platform. 
                  Each API requires an API key for authentication, which you can easily generate and manage from your dashboard.
                </p>
              </div>

              {/* 3-Step Guide */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <Card className="border-primary/30">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                        1
                      </div>
                      <CardTitle className="text-lg">Generate API Key</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Navigate to your <Link href="/dashboard/my-keys" className="text-primary hover:underline font-medium">Dashboard</Link> and click "Create New Key". 
                      Select the API you want to access and set any required permissions.
                    </p>
                    <div className="bg-muted/50 p-3 rounded-md">
                      <code className="text-xs text-foreground">sk_live_1234567890abcdef</code>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 2 */}
                <Card className="border-primary/30">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                        2
                      </div>
                      <CardTitle className="text-lg">Add to HTML Form</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Include your API key in the request headers when making API calls from your HTML form or JavaScript.
                    </p>
                    <div className="bg-muted/50 p-3 rounded-md overflow-x-auto">
                      <pre className="text-xs text-foreground">
{`<script>
  fetch('/gateway/api-slug', {
    headers: {
      'X-API-Key': 'your-key'
    }
  })
</script>`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 3 */}
                <Card className="border-primary/30">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                        3
                      </div>
                      <CardTitle className="text-lg">Make API Calls</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Send requests to the API endpoint through our gateway. Monitor usage and view analytics in your dashboard.
                    </p>
                    <div className="bg-muted/50 p-3 rounded-md">
                      <code className="text-xs text-foreground">
                        POST https://api.portsmith.dev/gateway/weather-api
                      </code>
                    </div>
                    <Button asChild size="sm" className="w-full mt-2">
                      <Link href="/dashboard">
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Info */}
              <div className="bg-muted/30 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-1">Need More Help?</p>
                    <p className="text-sm text-muted-foreground">
                      Check out our detailed guides for each API below, or visit our{' '}
                      <Link href="/contact?type=api" className="text-primary hover:underline font-medium">
                        support page
                      </Link>{' '}
                      to request a new API integration.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* Available APIs Section */}
          {!isLoading && !error && Object.keys(groupedApis).length > 0 && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Available APIs</h2>
              <p className="text-muted-foreground mb-8">Browse and explore our collection of integrated APIs</p>
            </div>
          )}

          {!isLoading && !error && Object.entries(groupedApis).map(([category, apis]) => (
            <div key={category} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-2xl font-bold">{category}</h3>
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
