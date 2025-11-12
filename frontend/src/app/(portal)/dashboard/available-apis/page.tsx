"use client";

import { useApiData } from "@/hooks/use-api-data";
import { useUser } from "@/hooks/use-user";
import { AvailableApisContent } from "@/components/Dashboard/AvailableApisContent";
import { ApiInfo } from "@/components/Dashboard/types";

export default function AvailableApisPage() {
  const { user } = useUser();
  const { data: apisData, isLoading, error } = useApiData<{apis: ApiInfo[]}>({
    endpoint: "/api/apis",
    method: "GET",
    dependencies: [user?.id],
  });

  const apis = apisData?.apis || [];

  return (
    <AvailableApisContent 
      apis={apis} 
      isLoading={isLoading} 
      error={error}
    />
  );
}
