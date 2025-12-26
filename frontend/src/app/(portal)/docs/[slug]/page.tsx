"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useApiData } from "@/hooks/use-api-data";
import { ChevronLeft } from "lucide-react";
import "swagger-ui-react/swagger-ui.css";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ApiSkeleton } from "@/components/ApiDocs/ApiSkeleton";
import { ApiDocsViewer } from "@/components/ApiDocs/ApiDocsViewer";
import ScrollNavbar from "@/components/Landing/scroll-navbar";

interface ApiDocumentation {
  slug: string;
  name: string;
  description: string;
  version?: string;
  mode: 'openapi' | 'markdown';
  baseUrl?: string;
  specData?: any;
  htmlDoc?: string;
  documentation?: string;
}

export default function ApiDocsDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: apiDoc, isLoading, error } = useApiData<ApiDocumentation>({
    endpoint: `/api/apis/${slug}`,
    dependencies: [slug],
  });

  const [specData, setSpecData] = useState<any>(null);
  const [htmlDoc, setHtmlDoc] = useState<string>("");

  useEffect(() => {
    if (!apiDoc) return;

    // Handle OpenAPI mode
    if (apiDoc.mode === 'openapi') {
      if (apiDoc.specData) {
        setSpecData(apiDoc.specData);
      } else if (apiDoc.baseUrl) {
        // Fallback: create minimal spec from baseUrl
        setSpecData({
          openapi: "3.0.0",
          info: {
            title: apiDoc.name,
            version: apiDoc.version || "1.0.0",
            description: apiDoc.description,
          },
          servers: [{ url: apiDoc.baseUrl }],
          paths: {},
        });
      }
    }

    // Handle Markdown mode
    if (apiDoc.mode === 'markdown' && apiDoc.htmlDoc) {
      setHtmlDoc(apiDoc.htmlDoc);
    }
  }, [apiDoc]);

  if (isLoading) {
    return (
      <>
        <ScrollNavbar />
        <div className="pt-20">
          <ApiSkeleton />
        </div>
      </>
    );
  }

  if (error || !apiDoc) {
    return (
      <>
        <ScrollNavbar />
        <div className="pt-20 px-4 container max-w-6xl">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/docs">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Documentation
                </Link>
              </Button>
            </div>

            <div className="bg-destructive/10 p-4 rounded-lg text-destructive max-w-md text-center">
              <h2 className="text-lg font-semibold mb-2">Error Loading Documentation</h2>
              <p>We couldn't load the documentation for this API. Please try again later.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ScrollNavbar />
      <div className="pt-20 px-4 container max-w-6xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/docs">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Documentation
                </Link>
              </Button>
            </div>
          </div>

          <ApiDocsViewer 
            api={apiDoc}
            specData={specData}
            htmlDoc={htmlDoc}
          />
        </div>
      </div>
    </>
  );
}