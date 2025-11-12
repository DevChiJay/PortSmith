"use client";

import { AlertCircle } from "lucide-react";
import { useApiData } from "@/hooks/use-api-data";
import { useUser } from "@/hooks/use-user";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ApiKeysList } from "@/components/Dashboard/ApiKeysList";
import { ApiKeysSkeleton } from "@/components/Dashboard/ApiKeysSkeleton";
import { ApiKey, ApiInfo } from "@/components/Dashboard/types";

export default function MyApiKeysPage() {
  const { user } = useUser();
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useApiData<{ keys: ApiKey[] }>({
    endpoint: "/api/keys",
    dependencies: [user?.id],
  });
  
  const { 
    data: apisData,
    isLoading: apisLoading 
  } = useApiData<{ apis: ApiInfo[] }>({
    endpoint: "/api/apis",
    dependencies: [user?.id],
  });

  const apiKeys = data?.keys || [];
  const availableApis = apisData?.apis || [];

  if (isLoading || apisLoading) {
    return <ApiKeysSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading API keys: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <ApiKeysList 
        apiKeys={apiKeys} 
        availableApis={availableApis} 
        refetch={refetch}
        user={user}
      />
    </div>
  );
}
