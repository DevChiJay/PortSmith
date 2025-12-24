"use client";

import React from "react";
import { DocView } from "./View";
import { MarkdownView } from "./MarkdownView";

type ApiDocsViewerProps = {
  api: {
    slug: string;
    name: string;
    description: string;
    version?: string;
    mode: 'openapi' | 'markdown';
    documentation?: string;
  };
  specData?: any;
  htmlDoc?: string;
};

export function ApiDocsViewer({ api, specData, htmlDoc }: ApiDocsViewerProps) {
  // Render OpenAPI documentation (Swagger/ReDoc)
  if (api.mode === 'openapi' && specData) {
    return (
      <DocView 
        apiDoc={{
          name: api.name,
          description: api.description,
          version: api.version,
          documentation: api.documentation || '',
        }}
        specData={specData}
      />
    );
  }

  // Render Markdown documentation
  if (api.mode === 'markdown' && htmlDoc) {
    return (
      <MarkdownView
        apiDoc={{
          name: api.name,
          description: api.description,
          version: api.version,
        }}
        htmlContent={htmlDoc}
      />
    );
  }

  // Fallback for missing data
  return (
    <div className="p-8 text-center text-muted-foreground">
      <p>No documentation available for this API.</p>
      <p className="text-sm mt-2">Mode: {api.mode}, Has spec: {!!specData}, Has HTML: {!!htmlDoc}</p>
    </div>
  );
}
