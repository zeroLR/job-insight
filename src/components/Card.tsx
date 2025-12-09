import React from 'react';
import { cn } from '../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div
    className={cn(
      'bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden',
      className,
    )}
  >
    {children}
  </div>
);
