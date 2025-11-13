'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StarDetailError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Star detail page error:', error);
  }, [error]);

  // Determine if this is a "not found" error or a database error
  const isNotFound = error.message.includes('NEXT_NOT_FOUND') || 
                     error.message.toLowerCase().includes('not found');

  return (
    <main className="min-h-screen px-6 py-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div 
          className="bg-gradient-to-br from-slate-900/80 to-indigo-950/80 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-8 shadow-lg shadow-indigo-500/20 text-center"
          role="alert"
          aria-live="assertive"
        >
          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-slate-50 mb-4">
            {isNotFound ? 'Star Not Found' : 'Something Went Wrong'}
          </h1>
          
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            {isNotFound
              ? 'This star may have been removed or the link is incorrect.'
              : 'Unable to load star data. Please try again later.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 text-slate-50 rounded-lg border border-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-400/40 hover:brightness-110 transition-all duration-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Return to Home</span>
            </Link>

            {!isNotFound && (
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-slate-50 rounded-lg border border-slate-600 shadow-lg shadow-slate-500/20 hover:shadow-slate-400/40 hover:brightness-110 transition-all duration-300 focus:ring-2 focus:ring-slate-400 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Try Again</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
