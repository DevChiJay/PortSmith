import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Code, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// Suppress React strict mode warnings for SwaggerUI
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('UNSAFE_componentWillReceiveProps')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
}

// Dynamically import Swagger UI to avoid SSR issues
const SwaggerUI = dynamic(
  () => import("swagger-ui-react"),
  { ssr: false }
);

// Dynamically import Redoc to avoid SSR issues
const RedocStandalone = dynamic(
  () => import("redoc").then((mod) => mod.RedocStandalone), 
  { ssr: false }
);

type DocViewProps = {
  apiDoc: {
    name: string;
    description: string;
    version?: string;
    documentation: string;
  };
  specData: any;
};

export function DocView({ apiDoc, specData }: DocViewProps) {
  const [activeTab, setActiveTab] = useState<"swagger" | "redoc">("swagger");

  const downloadSpec = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(specData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${apiDoc.name.toLowerCase().replace(/\\s+/g, '-')}-openapi.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Request interceptor to ensure API key is added to requests
  const requestInterceptor = (req: any) => {
    return req;
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-card to-card/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{apiDoc.name}</CardTitle>
              <CardDescription className="text-base">
                {apiDoc.version ? `Version ${apiDoc.version} • ` : ""}
                {apiDoc.description}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadSpec}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Spec
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Docs Viewer */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "swagger" | "redoc")} className="w-full">
            <div className="border-b bg-muted/30 px-6 pt-4">
              <TabsList className="h-12 bg-transparent border-b-0">
                <TabsTrigger 
                  value="swagger" 
                  className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Swagger UI
                </TabsTrigger>
                <TabsTrigger 
                  value="redoc"
                  className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full"
                >
                  <Code className="h-4 w-4" />
                  ReDoc
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="swagger" className="m-0 border-0 p-0">
              <div className="swagger-container min-h-[600px] p-6">
                {/* @ts-ignore: SwaggerUI types are not complete */}
                <SwaggerUI 
                  spec={specData || {}} 
                  docExpansion="list"
                  defaultModelsExpandDepth={1}
                  displayRequestDuration={true}
                  filter={true}
                  showRequestHeaders={true}
                  persistAuthorization={true}
                  requestInterceptor={requestInterceptor}
                />
              </div>
            </TabsContent>

            <TabsContent value="redoc" className="m-0 border-0 p-0">
              <div className="redoc-container min-h-[600px]">
                <RedocStandalone 
                  spec={specData || {}}
                  options={{
                    nativeScrollbars: true,
                    hideDownloadButton: false,
                    theme: { 
                      colors: { 
                        primary: { main: '#10B981' } 
                      },
                      typography: {
                        fontSize: '14px',
                        headings: {
                          fontFamily: 'sans-serif',
                        },
                      },
                    },
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}