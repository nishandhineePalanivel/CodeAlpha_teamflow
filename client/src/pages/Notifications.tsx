import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { Notification } from '../types';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res: any = await api.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (n: Notification) => {
    try {
      await api.patch(`/notifications/${n.id}/read`);
      setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)));
      if (n.relatedTaskId) {
        navigate(`/projects/${n.relatedProjectId}`);
      } else if (n.relatedProjectId) {
        navigate(`/projects/${n.relatedProjectId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading notifications..." />;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Notifications</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Activity updates, task assignments, and mentions
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCircle className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You are completely caught up!"
          icon={<Bell className="w-12 h-12 text-indigo-500" />}
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n)}
              className={`p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors ${
                !n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
              }`}
            >
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{n.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                <p className="text-[10px] text-slate-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>

              {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-1"></span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
