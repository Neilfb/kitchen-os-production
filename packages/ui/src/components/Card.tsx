import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
}

export function Card({ children, variant = 'default', className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg bg-white',
        variant === 'elevated' ? 'shadow-lg' : 'border border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
