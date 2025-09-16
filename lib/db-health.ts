import { prisma } from "@/lib/db";
import { DatabaseError } from "@/lib/api-error-handler";

export interface DatabaseHealthStatus {
  isHealthy: boolean;
  latency?: number;
  error?: string;
  timestamp: string;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  const startTime = Date.now();
  
  try {
    // Simple query to test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const latency = Date.now() - startTime;
    
    return {
      isHealthy: true,
      latency,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Database health check failed:", error);
    
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : "Unknown database error",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function ensureDatabaseConnection(): Promise<void> {
  const health = await checkDatabaseHealth();
  
  if (!health.isHealthy) {
    throw new DatabaseError(`Database connection failed: ${health.error}`);
  }
}

// Graceful database disconnection
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error("Error disconnecting from database:", error);
  }
}

// Database connection retry logic
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }
  
  throw new DatabaseError(`Database operation failed after ${maxRetries} attempts: ${lastError.message}`);
}