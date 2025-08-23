'use client';

import { FC } from 'react';

interface LoaderProps {
  message?: string;
}

const Loader: FC<LoaderProps> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-3"></div>
    <span>{message}</span>
  </div>
);

export default Loader;
