import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  type?: 'neutral' | 'primary' | 'success' | 'warning' | 'error';
}

export const Badge: React.FC<BadgeProps> = ({ children, type = 'neutral' }) => {
  const styles = {
    neutral: 'bg-slate-100 text-slate-600',
    primary: 'bg-blue-50 text-blue-700 border border-blue-100',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
    error: 'bg-red-50 text-red-700 border border-red-100',
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[type]}`}
    >
      {children}
    </span>
  );
};
