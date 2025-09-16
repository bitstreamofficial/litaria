import { z } from "zod";

// Common validation schemas
export const emailSchema = z.string().email("Please enter a valid email address");
export const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
export const nameSchema = z.string().min(2, "Name must be at least 2 characters");

// Form validation utilities
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
}

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult {
  try {
    schema.parse(data);
    return {
      isValid: true,
      errors: [],
      fieldErrors: {},
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      const errors: string[] = [];

      error.errors.forEach((err) => {
        const path = err.path.join(".");
        const message = err.message;
        
        if (path) {
          fieldErrors[path] = message;
        }
        errors.push(message);
      });

      return {
        isValid: false,
        errors,
        fieldErrors,
      };
    }

    return {
      isValid: false,
      errors: ["An unexpected validation error occurred"],
      fieldErrors: {},
    };
  }
}

// Enhanced form error display component
export interface FormErrorsProps {
  errors: string[];
  className?: string;
}

export function getFieldError(
  fieldErrors: Record<string, string>,
  fieldName: string
): string | undefined {
  return fieldErrors[fieldName];
}

// Async validation wrapper
export async function validateAsync<T>(
  validationFn: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await validationFn();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation failed";
    return { success: false, error: message };
  }
}

// Form submission wrapper with error handling
export async function handleFormSubmission<T>(
  submitFn: () => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    onFinally?: () => void;
  }
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await submitFn();
    options?.onSuccess?.(data);
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    options?.onError?.(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    options?.onFinally?.();
  }
}

// Network error handling
export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError ||
    (error instanceof Error && error.message.includes("fetch"))
  );
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === "string") {
    return error;
  }
  
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  
  return "An unexpected error occurred";
}

// API error response handling
export interface APIErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export function isAPIErrorResponse(data: unknown): data is APIErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    "message" in data &&
    "statusCode" in data
  );
}

export function handleAPIError(response: Response, data: unknown): string {
  if (isAPIErrorResponse(data)) {
    return data.message;
  }
  
  // Handle common HTTP status codes
  switch (response.status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "You are not authorized. Please log in.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "A conflict occurred. The resource may already exist.";
    case 422:
      return "Invalid data provided. Please check your input.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}