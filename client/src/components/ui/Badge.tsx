import React from 'react';
import { clsx } from 'clsx';
import { TaskPriority, TaskStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  priority?: TaskPriority;
  status?: TaskStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  priority,
  status,
  size = 'sm',
  className,
}) => {
  let colorStyles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  if (priority) {
    switch (priority) {
      case 'LOW':
        colorStyles = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
        break;
      case 'MEDIUM':
        colorStyles = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50';
        break;
      case 'HIGH':
        colorStyles = 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50';
        break;
      case 'URGENT':
        colorStyles = 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800/50 font-semibold';
        break;
    }
  } else if (status) {
    switch (status) {
      case 'TODO':
        colorStyles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        break;
      case 'IN_PROGRESS':
        colorStyles = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400';
        break;
      case 'IN_REVIEW':
        colorStyles = 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400';
        break;
      case 'DONE':
        colorStyles = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400';
        break;
    }
  } else {
    switch (variant) {
      case 'primary':
        colorStyles = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400';
        break;
      case 'success':
        colorStyles = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400';
        break;
      case 'warning':
        colorStyles = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400';
        break;
      case 'danger':
        colorStyles = 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400';
        break;
      case 'info':
        colorStyles = 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400';
        break;
    }
  }

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={clsx('inline-flex items-center font-medium rounded-md tracking-wide uppercase', colorStyles, sizeStyles, className)}>
      {children}
    </span>
  );
};
