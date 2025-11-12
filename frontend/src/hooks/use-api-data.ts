import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useApiClient } from './use-api-client';

interface ApiDataOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  dependencies?: any[];
}

export function useApiData<T>({ endpoint, method = 'GET', body, dependencies = [] }: ApiDataOptions) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { request } = useApiClient();

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use the custom API client for requests
        const response = await request<T>(endpoint, {
          method,
          ...(body && { body: JSON.stringify(body) }),
        });

        setData(response);
      } catch (err) {
        const error = err as Error;
        setError(error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have valid dependencies
    if (!dependencies.some(dep => dep === undefined || dep === null)) {
      fetchData();
    }
  }, [...dependencies, refreshTrigger]);

  const refetch = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return { data, error, isLoading, refetch };
}