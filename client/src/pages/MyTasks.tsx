import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Calendar, Search, Filter } from 'lucide-react';
import api from '../services/api';
import { Task } from '../types';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';

export const MyTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/my-tasks')
      .then((res: any) => {
        if (res.success && res.data) {
          setTasks(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !selectedStatus || t.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <LoadingSpinner label="Loading your tasks..." />;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">My Tasks</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            All tasks assigned to you across your projects
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search my tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No assigned tasks found"
          description="You currently don't have any tasks matching your filters."
          icon={<CheckSquare className="w-12 h-12 text-indigo-500" />}
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
          {filteredTasks.map((t) => (
            <Link
              key={t.id}
              to={`/projects/${t.projectId}`}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {t.title}
                </h4>
                <div className="flex items-center space-x-3 text-xs">
                  {t.project && (
                    <span
                      className="font-semibold px-2 py-0.5 rounded text-[11px]"
                      style={{ backgroundColor: `${t.project.color}20`, color: t.project.color }}
                    >
                      {t.project.name}
                    </span>
                  )}
                  {t.dueDate && (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Due {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge priority={t.priority}>{t.priority}</Badge>
                <Badge status={t.status}>{t.status.replace('_', ' ')}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
