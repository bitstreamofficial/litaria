import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db-health";
import { withErrorHandler } from "@/lib/api-error-handler";

export const GET = withErrorHandler(async () => {
  const dbHealth = await checkDatabaseHealth();
  
  const healthStatus = {
    status: dbHealth.isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbHealth.isHealthy ? "up" : "down",
        latency: dbHealth.latency,
        error: dbHealth.error,
      },
    },
    version: process.env.npm_package_version || "unknown",
    environment: process.env.NODE_ENV || "unknown",
  };

  const statusCode = dbHealth.isHealthy ? 200 : 503;
  
  return NextResponse.json(healthStatus, { status: statusCode });
});