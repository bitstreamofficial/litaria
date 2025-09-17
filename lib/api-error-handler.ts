import { ZodError, z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Standard API error response interface
export interface APIErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

// Error types
export enum ErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  CONFLICT_ERROR = "CONFLICT_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

// Custom error classes
export class APIError extends Error {
  public statusCode: number;
  public type: ErrorType;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    type: ErrorType = ErrorType.INTERNAL_ERROR,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends APIError {
  constructor(message: string = "Validation failed") {
    super(message, 400, ErrorType.VALIDATION_ERROR);
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = "Authentication required") {
    super(message, 401, ErrorType.AUTHENTICATION_ERROR);
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, ErrorType.AUTHORIZATION_ERROR);
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = "Resource not found") {
    super(message, 404, ErrorType.NOT_FOUND_ERROR);
  }
}

export class ConflictError extends APIError {
  constructor(message: string = "Resource conflict") {
    super(message, 409, ErrorType.CONFLICT_ERROR);
  }
}

export class DatabaseError extends APIError {
  constructor(message: string = "Database operation failed") {
    super(message, 500, ErrorType.DATABASE_ERROR);
  }
}

// Error response creator
export function createErrorResponse(
  error: unknown,
  path?: string
): NextResponse<APIErrorResponse> {
  let statusCode = 500;
  let message = "Internal server error";
  let type = ErrorType.INTERNAL_ERROR;

  // Handle known error types
  if (error instanceof APIError) {
    statusCode = error.statusCode;
    message = error.message;
    type = error.type;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed: " + error.issues.map(e => e.message).join(", ");
    type = ErrorType.VALIDATION_ERROR;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const { code, message: prismaMessage } = error;
    
    switch (code) {
      case "P2002":
        statusCode = 409;
        message = "A record with this information already exists";
        type = ErrorType.CONFLICT_ERROR;
        break;
      case "P2025":
        statusCode = 404;
        message = "Record not found";
        type = ErrorType.NOT_FOUND_ERROR;
        break;
      case "P2003":
        statusCode = 400;
        message = "Invalid reference to related record";
        type = ErrorType.VALIDATION_ERROR;
        break;
      default:
        statusCode = 500;
        message = "Database operation failed";
        type = ErrorType.DATABASE_ERROR;
    }
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    message = "Database connection error";
    type = ErrorType.DATABASE_ERROR;
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500;
    message = "Database initialization error";
    type = ErrorType.DATABASE_ERROR;
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Log error for debugging (without exposing sensitive data)
  logError(error, { statusCode, type, path });

  // Create sanitized response
  const errorResponse: APIErrorResponse = {
    error: type,
    message: sanitizeErrorMessage(message, statusCode),
    statusCode,
    timestamp: new Date().toISOString(),
    ...(path && { path }),
  };

  return NextResponse.json(errorResponse, { status: statusCode });
}

// Sanitize error messages to avoid exposing sensitive information
function sanitizeErrorMessage(message: string, statusCode: number): string {
  // In production, provide generic messages for server errors
  if (process.env.NODE_ENV === "production" && statusCode >= 500) {
    return "An internal server error occurred. Please try again later.";
  }

  // Remove sensitive information patterns
  const sensitivePatterns = [
    /password/gi,
    /token/gi,
    /secret/gi,
    /key/gi,
    /connection string/gi,
    /database url/gi,
  ];

  let sanitized = message;
  sensitivePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  });

  return sanitized;
}

// Error logging function
async function logError(
  error: unknown,
  context: {
    statusCode: number;
    type: ErrorType;
    path?: string;
  }
) {
  const { errorLogger } = await import('./error-logger');
  
  await errorLogger.logError(
    `API Error: ${context.type}`,
    error instanceof Error ? error : new Error(String(error)),
    {
      path: context.path,
    },
    {
      statusCode: context.statusCode,
      type: context.type,
    }
  );
}

// Async error handler wrapper for API routes
export function withErrorHandler<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<APIErrorResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}

// Database connection error handler
export async function handleDatabaseOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new DatabaseError("Unable to connect to database");
    }
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      throw new DatabaseError("Database connection lost");
    }
    throw error;
  }
}

// Validation helper
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(
        "Invalid request data: " + error.issues.map(e => e.message).join(", ")
      );
    }
    throw error;
  }
}