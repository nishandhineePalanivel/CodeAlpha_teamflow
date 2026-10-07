import React, { useState } from 'react';
import { Sun, Moon, Laptop, Bell, Shield, Palette } from 'lucide-react';
import { useTheme } from '../stores/themeStore';
import { Button } from '../components/ui/Button';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const [taskAssignments, setTaskAssignments] = useState(true);
  const [comments, setComments] = useState(true);
  const [invitations, setInvitations] = useState(true);
  const [taskUpdates, setTaskUpdates] = useState(true);

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Customize application theme and notification preferences
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 md:p-8 shadow-xs space-y-8">
        {/* Appearance Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-600" /> Theme Appearance
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="text-xs font-bold">Light Mode</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="text-xs font-bold">Dark Mode</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                theme === 'system'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Laptop className="w-5 h-5" />
              <span className="text-xs font-bold">System Default</span>
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" /> Notification Preferences
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Task assignments
              </span>
              <input
                type="checkbox"
                checked={taskAssignments}
                onChange={(e) => setTaskAssignments(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Comments on my tasks
              </span>
              <input
                type="checkbox"
                checked={comments}
                onChange={(e) => setComments(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Project invitations
              </span>
              <input
                type="checkbox"
                checked={invitations}
                onChange={(e) => setInvitations(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Task status updates
              </span>
              <input
                type="checkbox"
                checked={taskUpdates}
                onChange={(e) => setTaskUpdates(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button onClick={handleSave}>
            {isSaved ? 'Preferences Saved!' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};
