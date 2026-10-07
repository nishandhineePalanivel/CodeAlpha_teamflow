import React from 'react';
import { Activity } from '../../types';
import { Avatar } from '../ui/Avatar';

interface RecentActivityProps {
  activities: Activity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
      <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
        Recent Activity
      </h3>

      {activities.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">No recent activity recorded.</p>
      ) : (
        <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-700/50">
          {activities.map((a) => (
            <div key={a.id} className="pt-3 first:pt-0 flex items-start space-x-3">
              <Avatar name={a.user.name} src={a.user.avatar} size="xs" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                  <span className="font-bold">{a.user.name}</span>{' '}
                  <span className="text-slate-600 dark:text-slate-400">{a.action}</span>
                </p>
                {a.project && (
                  <span
                    className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.2 rounded"
                    style={{ backgroundColor: `${a.project.color}20`, color: a.project.color }}
                  >
                    {a.project.name}
                  </span>
                )}
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
