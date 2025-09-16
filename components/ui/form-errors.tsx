"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorsProps {
  errors: string[];
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function FormErrors({ 
  errors, 
  className, 
  dismissible = false, 
  onDismiss 
}: FormErrorsProps) {
  if (errors.length === 0) return null;

  return (
    <div className={cn(
      "bg-destructive/10 border border-destructive/20 rounded-md p-4",
      className
    )}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {errors.length === 1 ? (
            <p className="text-destructive text-sm">{errors[0]}</p>
          ) : (
            <div>
              <p className="text-destructive font-medium text-sm mb-2">
                Please fix the following errors:
              </p>
              <ul className="text-destructive text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-destructive/60">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="text-destructive/60 hover:text-destructive flex-shrink-0"
            aria-label="Dismiss errors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export function FieldError({ error, className }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p className={cn("text-sm text-destructive", className)}>
      {error}
    </p>
  );
}

interface SuccessMessageProps {
  message: string;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function SuccessMessage({ 
  message, 
  className, 
  dismissible = false, 
  onDismiss 
}: SuccessMessageProps) {
  return (
    <div className={cn(
      "bg-green-50 border border-green-200 rounded-md p-4",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-green-600 text-sm flex-1">{message}</p>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="text-green-600/60 hover:text-green-600 flex-shrink-0"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}