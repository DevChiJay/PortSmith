import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Code } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Swagger UI to avoid SSR issues
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });
// Dynamically import Redoc to avoid SSR issues
const RedocStandalone = dynamic(() => import("redoc").then((mod) => mod.RedocStandalone), { ssr: false });

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{apiDoc.name}</CardTitle>
        <CardDescription>
          {apiDoc.version ? `Version ${apiDoc.version} - ` : ""}
          {apiDoc.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "swagger" | "redoc")}>
          <TabsList className="mb-4">
            <TabsTrigger value="swagger">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Swagger UI
            </TabsTrigger>
            <TabsTrigger value="redoc">
              <Code className="h-4 w-4 mr-2" />
              ReDoc
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swagger" className="border rounded-lg p-0 overflow-hidden">
            <div className="swagger-container">
              {/* @ts-ignore: SwaggerUI types are not complete */}
              <SwaggerUI spec={specData || {}} />
            </div>
          </TabsContent>

          <TabsContent value="redoc" className="border rounded-lg overflow-hidden">
            <RedocStandalone spec={specData || {}} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}