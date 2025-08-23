'use client';

import { FC } from 'react';

interface ErrorDisplayProps {
  error: Error;
  resetError?: () => void;
}

const ErrorDisplay: FC<ErrorDisplayProps> = ({ error, resetError }) => (
  <div className="p-4 border border-red-500 rounded bg-red-50">
    <h2 className="text-red-700 font-semibold mb-2">Error</h2>
    <p className="text-red-600 mb-4">{error.message}</p>
    {resetError && (
      <button
        onClick={resetError}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try Again
      </button>
    )}
  </div>
);

export default ErrorDisplay;
