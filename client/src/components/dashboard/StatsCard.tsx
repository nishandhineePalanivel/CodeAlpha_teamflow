import React from 'react';
import { clsx } from 'clsx';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'indigo' | 'blue' | 'amber' | 'emerald';
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color = 'indigo', subtitle }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{value}</h3>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>
      <div className={clsx('p-3.5 rounded-2xl flex items-center justify-center shrink-0', colorMap[color])}>
        {icon}
      </div>
    </div>
  );
};
