"use client";

import React from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2 
      className={cn("animate-spin", sizeClasses[size], className)} 
    />
  );
}

interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LoadingCard({ 
  title = "Loading...", 
  description = "Please wait while we load your content.",
  className 
}: LoadingCardProps) {
  return (
    <Card className={cn("max-w-md mx-auto", className)}>
      <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
        <LoadingSpinner size="lg" />
        <div className="text-center space-y-2">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  loadingText = "Loading..." 
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-2">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export function ErrorState({ 
  title = "Something went wrong",
  description = "An error occurred while loading content. Please try again.",
  onRetry,
  retryText = "Try Again",
  className 
}: ErrorStateProps) {
  return (
    <Card className={cn("max-w-md mx-auto", className)}>
      <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center space-y-2">
          <h3 className="font-medium text-destructive">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            {retryText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface SuccessStateProps {
  title?: string;
  description?: string;
  onContinue?: () => void;
  continueText?: string;
  className?: string;
}

export function SuccessState({ 
  title = "Success!",
  description = "Operation completed successfully.",
  onContinue,
  continueText = "Continue",
  className 
}: SuccessStateProps) {
  return (
    <Card className={cn("max-w-md mx-auto", className)}>
      <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
        <div className="text-center space-y-2">
          <h3 className="font-medium text-green-600">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {onContinue && (
          <Button onClick={onContinue} size="sm">
            {continueText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  title = "No content found",
  description = "There's nothing to display here yet.",
  action,
  className 
}: EmptyStateProps) {
  return (
    <Card className={cn("max-w-md mx-auto", className)}>
      <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <div className="h-6 w-6 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action && (
          <Button onClick={action.onClick} size="sm">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}