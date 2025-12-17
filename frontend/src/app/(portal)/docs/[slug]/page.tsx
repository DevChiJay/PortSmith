"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useApiData } from "@/hooks/use-api-data";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ApiSkeleton } from "@/components/ApiDocs/ApiSkeleton";
import { DocView } from "@/components/ApiDocs/View";
import { ApiDocumentation } from "@/components/Docs/types";

export default function ApiDocsDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: apiDoc, isLoading, error } = useApiData<ApiDocumentation>({
    endpoint: `/api/apis/${slug}`,
    dependencies: [slug],
  });

  const [specData, setSpecData] = useState<any>(null);

  useEffect(() => {
    if (apiDoc?.baseUrl && !apiDoc.specData) {
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
    } else if (apiDoc?.specData) {
      setSpecData(apiDoc.specData);
    }
  }, [apiDoc]);

  if (isLoading) {
    return <ApiSkeleton />;
  }

  if (error || !apiDoc) {
    return (
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
    );
  }

  return (
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

      <DocView apiDoc={apiDoc} specData={specData} />
    </div>
  );
}