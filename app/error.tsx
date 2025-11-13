'use client';

import { useEffect } from 'react';

/**
 * Global error boundary for the application
 * Catches and displays errors that occur during rendering
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center space-y-6 max-w-lg px-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-red-400">
            Something went wrong
          </h2>
          <p className="text-slate-300">
            We encountered an unexpected error. This has been logged for investigation.
          </p>
        </div>
        
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-left">
            <p className="text-xs font-mono text-red-300 break-words">
              {error.message}
            </p>
          </div>
        )}

        <button
          onClick={reset}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
