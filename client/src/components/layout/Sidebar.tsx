import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, FolderKanban, Bell, Settings, User, LogOut, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '../../stores/authStore';
import api from '../../services/api';
import { Project } from '../../types';

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    api.get('/projects')
      .then((res: any) => {
        if (res.success && res.data) {
          setProjects(res.data.slice(0, 5));
        }
      })
      .catch(() => {});
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Tasks', path: '/my-tasks', icon: CheckSquare },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 min-h-[calc(100vh-4rem)] select-none">
      <div className="p-4 flex-1 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Main Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Quick Projects */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between px-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent Projects</p>
            <NavLink to="/projects" className="text-slate-400 hover:text-white" title="All Projects">
              <Plus className="w-4 h-4" />
            </NavLink>
          </div>
          <div className="space-y-1">
            {projects.map((p) => (
              <NavLink
                key={p.id}
                to={`/projects/${p.id}`}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'hover:bg-slate-800/60 text-slate-400'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }}></span>
                  <span className="truncate">{p.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
