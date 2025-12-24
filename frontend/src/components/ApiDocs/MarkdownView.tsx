"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

type MarkdownViewProps = {
  apiDoc: {
    name: string;
    description: string;
    version?: string;
  };
  htmlContent: string;
};

export function MarkdownView({ apiDoc, htmlContent }: MarkdownViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <CardTitle>{apiDoc.name}</CardTitle>
        </div>
        <CardDescription>
          {apiDoc.version ? `Version ${apiDoc.version} - ` : ""}
          {apiDoc.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className="markdown-content prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
          }}
        />
      </CardContent>
    </Card>
  );
}
