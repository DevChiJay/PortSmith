'use client';

import { ReactNode } from 'react';
import { AlertCircle, RefreshCcw, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  onRetry?: () => void;
  showRetry?: boolean;
  variant?: 'default' | 'network' | 'server' | 'not-found';
}

/**
 * Reusable error display component with retry button
 * Shows different variants for common error types
 */
export function ErrorState({
  title,
  message,
  icon,
  onRetry,
  showRetry = true,
  variant = 'default',
}: ErrorStateProps) {
  // Default content based on variant
  const getDefaultContent = () => {
    switch (variant) {
      case 'network':
        return {
          title: 'Connection Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          icon: <WifiOff className="h-8 w-8 text-muted-foreground" />,
        };
      case 'server':
        return {
          title: 'Server Error',
          message: 'The server encountered an error. Please try again later.',
          icon: <ServerCrash className="h-8 w-8 text-muted-foreground" />,
        };
      case 'not-found':
        return {
          title: 'Not Found',
          message: 'The requested resource could not be found.',
          icon: <AlertCircle className="h-8 w-8 text-muted-foreground" />,
        };
      default:
        return {
          title: 'Error',
          message: 'An error occurred while loading this content.',
          icon: <AlertCircle className="h-8 w-8 text-muted-foreground" />,
        };
    }
  };

  const defaults = getDefaultContent();
  const displayTitle = title || defaults.title;
  const displayMessage = message || defaults.message;
  const displayIcon = icon || defaults.icon;

  return (
    <div className="flex items-center justify-center min-h-[300px] p-4">
      <Card className="max-w-md w-full border-dashed">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{displayIcon}</div>
          <CardTitle>{displayTitle}</CardTitle>
          <CardDescription>{displayMessage}</CardDescription>
        </CardHeader>
        {showRetry && onRetry && (
          <CardContent className="flex justify-center">
            <Button onClick={onRetry} variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
