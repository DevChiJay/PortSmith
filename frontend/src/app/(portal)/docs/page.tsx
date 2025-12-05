"use client";

import Head from "next/head";
import Link from "next/link";
import ScrollNavbar from "@/components/scroll-navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book, Code2, Zap, ExternalLink, FileCode, Layers } from "lucide-react";

export default function DocsPage() {
  return (
    <>
      <ScrollNavbar />
      <Head>
        <title>API Documentation - PortSmith</title>
        <meta name="description" content="Comprehensive API documentation for PortSmith Gateway." />
        <meta property="og:title" content="API Documentation - PortSmith" />
        <meta property="og:description" content="Comprehensive API documentation for PortSmith Gateway." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://portsmith.com/docs" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      
      <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-5xl">
          {/* Header */}
          <div className="text-center space-y-4 mb-16">
            <Badge className="mb-2">Documentation</Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              API Documentation
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive guides and references for integrating with PortSmith APIs
            </p>
          </div>

          {/* Quick Start Section */}
          <Card className="mb-8 glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Quick Start</CardTitle>
              </div>
              <CardDescription>
                Get started with PortSmith in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Sign up for an account</h4>
                    <p className="text-sm text-muted-foreground">
                      Create a free account to get your API key
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Get your API key</h4>
                    <p className="text-sm text-muted-foreground">
                      Navigate to your dashboard to generate API keys
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Make your first request</h4>
                    <p className="text-sm text-muted-foreground">
                      Include your API key in the headers and start making requests
                    </p>
                  </div>
                </div>
              </div>

              {/* Code Example */}
              <div className="mt-6 rounded-lg bg-gray-900 p-4 font-mono text-sm">
                <div className="text-gray-400">
                  <span className="text-purple-400">const</span>{" "}
                  <span className="text-blue-300">response</span>{" "}
                  <span className="text-gray-300">=</span>{" "}
                  <span className="text-purple-400">await</span>{" "}
                  <span className="text-yellow-300">fetch</span>
                  <span className="text-gray-300">(</span>
                </div>
                <div className="text-green-400 ml-4">
                  'https://api.portsmith.com/v1/...'
                  <span className="text-gray-300">,</span>
                </div>
                <div className="text-gray-400 ml-4">
                  <span className="text-gray-300">{'{'}</span>
                </div>
                <div className="text-gray-400 ml-8">
                  <span className="text-blue-300">headers</span>
                  <span className="text-gray-300">: {'{'}</span>
                </div>
                <div className="text-gray-400 ml-12">
                  <span className="text-green-400">'X-API-Key'</span>
                  <span className="text-gray-300">:</span>{" "}
                  <span className="text-orange-400">your_api_key</span>
                </div>
                <div className="text-gray-400 ml-8">
                  <span className="text-gray-300">{'}'}</span>
                </div>
                <div className="text-gray-400 ml-4">
                  <span className="text-gray-300">{'}'}</span>
                </div>
                <div className="text-gray-400">
                  <span className="text-gray-300">)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Resources Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="glass-card group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-primary" />
                  <CardTitle>API Reference</CardTitle>
                </div>
                <CardDescription>
                  Complete REST API documentation with interactive examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  FastAPI-powered APIs with automatic Swagger/OpenAPI documentation. 
                  Interactive playground to test endpoints in real-time.
                </p>
                <Button variant="outline" className="w-full group-hover:border-primary" asChild>
                  <Link href="/api/docs" className="flex items-center gap-2">
                    View API Reference
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  <CardTitle>SDK Libraries</CardTitle>
                </div>
                <CardDescription>
                  Official client libraries for popular languages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Pre-built SDKs for Python, JavaScript, Go, and more. 
                  Type-safe, well-documented, and ready to use.
                </p>
                <Button variant="outline" className="w-full group-hover:border-primary" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-primary" />
                  <CardTitle>Code Examples</CardTitle>
                </div>
                <CardDescription>
                  Working examples and integration guides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Real-world examples showing common use cases and best practices 
                  for integrating with PortSmith.
                </p>
                <Button variant="outline" className="w-full group-hover:border-primary" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <CardTitle>Guides & Tutorials</CardTitle>
                </div>
                <CardDescription>
                  Step-by-step tutorials for common scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  In-depth guides covering authentication, rate limiting, 
                  webhooks, and advanced features.
                </p>
                <Button variant="outline" className="w-full group-hover:border-primary" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Banner */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">
                    FastAPI + Swagger Documentation
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    All PortSmith APIs are built with FastAPI, which automatically generates 
                    interactive Swagger/OpenAPI documentation. Once APIs are deployed, you'll 
                    have access to:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Interactive API explorer (Swagger UI)</li>
                    <li>• Automatic request/response validation</li>
                    <li>• Try-it-out functionality for all endpoints</li>
                    <li>• Auto-generated OpenAPI 3.0 specifications</li>
                    <li>• Type-safe schema documentation</li>
                  </ul>
                  <div className="mt-4 flex gap-3">
                    <Button size="sm" asChild>
                      <Link href="/dashboard">Get Your API Key</Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/contact">Contact Support</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
