import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, CheckSquare, Clock, CheckCircle2, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../stores/authStore';
import { StatsCard } from '../components/dashboard/StatsCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { ProjectCard } from '../components/project/ProjectCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import api from '../services/api';
import { Project, Task, Activity } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [projRes, tasksRes, actRes]: any[] = await Promise.all([
          api.get('/projects'),
          api.get('/my-tasks'),
          api.get('/activity/recent'),
        ]);

        if (projRes.success) setProjects(projRes.data || []);
        if (tasksRes.success) setMyTasks(tasksRes.data || []);
        if (actRes.success) setActivities(actRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const activeTasksCount = myTasks.filter((t) => t.status !== 'DONE').length;
  const completedTasksCount = myTasks.filter((t) => t.status === 'DONE').length;
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const dueSoonCount = myTasks.filter(
    (t) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) <= threeDaysFromNow
  ).length;

  if (isLoading) return <LoadingSpinner label="Loading dashboard..." />;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {getGreeting()}, {user?.name || 'Collaborator'}!
          </h1>
          <p className="text-indigo-100 text-xs md:text-sm">
            Here is a summary of your workspace activity and current tasks.
          </p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" /> Create Project
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          title="Total Projects"
          value={projects.length}
          icon={<FolderKanban className="w-6 h-6" />}
          color="indigo"
          subtitle="Active workspaces"
        />
        <StatsCard
          title="Active Tasks"
          value={activeTasksCount}
          icon={<CheckSquare className="w-6 h-6" />}
          color="blue"
          subtitle="Assigned to you"
        />
        <StatsCard
          title="Tasks Due Soon"
          value={dueSoonCount}
          icon={<Clock className="w-6 h-6" />}
          color="amber"
          subtitle="Next 3 days"
        />
        <StatsCard
          title="Completed Tasks"
          value={completedTasksCount}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="emerald"
          subtitle="Finished work"
        />
      </div>

      {/* Main Dashboard Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Tasks & Projects */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Tasks */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                My Tasks ({myTasks.length})
              </h2>
              <Link
                to="/my-tasks"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {myTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No tasks assigned to you yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {myTasks.slice(0, 5).map((t) => (
                  <Link
                    key={t.id}
                    to={`/projects/${t.projectId}`}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/40 px-2 rounded-xl transition-colors group"
                  >
                    <div className="space-y-1 min-w-0 flex-1 pr-4">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                        {t.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        {t.project && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.2 rounded"
                            style={{ backgroundColor: `${t.project.color}20`, color: t.project.color }}
                          >
                            {t.project.name}
                          </span>
                        )}
                        {t.dueDate && (
                          <span className="text-[10px] text-slate-400">
                            Due {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <Badge priority={t.priority}>{t.priority}</Badge>
                      <Badge status={t.status}>{t.status.replace('_', ' ')}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Recent Projects
              </h2>
              <Link
                to="/projects"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                All Projects <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Stream */}
        <div className="space-y-6">
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
};
