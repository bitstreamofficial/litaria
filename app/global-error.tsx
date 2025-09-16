"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Global error:", error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-gray-900">500</h1>
              <h2 className="text-2xl font-semibold text-gray-700">
                Server Error
              </h2>
              <p className="text-gray-600">
                Something went wrong on our end. Please try again later.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 border border-teal-700 text-teal-700 rounded-md hover:bg-teal-50 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}