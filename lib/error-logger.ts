interface ErrorLogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: {
    userId?: string;
    path?: string;
    method?: string;
    userAgent?: string;
    ip?: string;
  };
  metadata?: Record<string, any>;
}

class ErrorLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private createLogEntry(
    level: ErrorLogEntry['level'],
    message: string,
    error?: Error,
    context?: ErrorLogEntry['context'],
    metadata?: Record<string, any>
  ): ErrorLogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          ...(this.isDevelopment && { stack: error.stack }),
        },
      }),
      ...(context && { context }),
      ...(metadata && { metadata }),
    };
  }

  private sanitizeContext(context: ErrorLogEntry['context']): ErrorLogEntry['context'] {
    if (!context) return context;

    // Remove sensitive information
    const sanitized = { ...context };
    
    // Remove or mask sensitive headers
    if (sanitized.userAgent) {
      // Keep user agent but could be truncated if needed
    }
    
    return sanitized;
  }

  private logToConsole(entry: ErrorLogEntry): void {
    const logMethod = entry.level === 'error' ? console.error : 
                     entry.level === 'warn' ? console.warn : 
                     console.info;

    if (this.isDevelopment) {
      // Full logging in development
      logMethod('Error Log:', entry);
    } else {
      // Minimal logging in production
      logMethod(`[${entry.level.toUpperCase()}] ${entry.message}`, {
        timestamp: entry.timestamp,
        ...(entry.context && { context: this.sanitizeContext(entry.context) }),
      });
    }
  }

  private async logToExternalService(entry: ErrorLogEntry): Promise<void> {
    // In a real application, you would send logs to services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - CloudWatch
    // - Custom logging endpoint

    if (this.isProduction) {
      try {
        // Example: Send to external logging service
        // await fetch('/api/logs', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(entry),
        // });
      } catch (error) {
        // Fallback to console if external logging fails
        console.error('Failed to send log to external service:', error);
        this.logToConsole(entry);
      }
    }
  }

  public async logError(
    message: string,
    error?: Error,
    context?: ErrorLogEntry['context'],
    metadata?: Record<string, any>
  ): Promise<void> {
    const entry = this.createLogEntry('error', message, error, context, metadata);
    
    this.logToConsole(entry);
    await this.logToExternalService(entry);
  }

  public async logWarning(
    message: string,
    context?: ErrorLogEntry['context'],
    metadata?: Record<string, any>
  ): Promise<void> {
    const entry = this.createLogEntry('warn', message, undefined, context, metadata);
    
    this.logToConsole(entry);
    await this.logToExternalService(entry);
  }

  public async logInfo(
    message: string,
    context?: ErrorLogEntry['context'],
    metadata?: Record<string, any>
  ): Promise<void> {
    const entry = this.createLogEntry('info', message, undefined, context, metadata);
    
    this.logToConsole(entry);
    await this.logToExternalService(entry);
  }

  // API-specific logging methods
  public async logAPIError(
    error: Error,
    request: {
      method: string;
      path: string;
      userAgent?: string;
      ip?: string;
    },
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logError(
      `API Error: ${request.method} ${request.path}`,
      error,
      {
        userId,
        path: request.path,
        method: request.method,
        userAgent: request.userAgent,
        ip: request.ip,
      },
      metadata
    );
  }

  // Database-specific logging
  public async logDatabaseError(
    error: Error,
    operation: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logError(
      `Database Error: ${operation}`,
      error,
      undefined,
      { operation, ...metadata }
    );
  }

  // Authentication-specific logging
  public async logAuthError(
    error: Error,
    userId?: string,
    action?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logError(
      `Authentication Error: ${action || 'unknown'}`,
      error,
      { userId },
      { action, ...metadata }
    );
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Convenience functions
export const logError = errorLogger.logError.bind(errorLogger);
export const logWarning = errorLogger.logWarning.bind(errorLogger);
export const logInfo = errorLogger.logInfo.bind(errorLogger);
export const logAPIError = errorLogger.logAPIError.bind(errorLogger);
export const logDatabaseError = errorLogger.logDatabaseError.bind(errorLogger);
export const logAuthError = errorLogger.logAuthError.bind(errorLogger);