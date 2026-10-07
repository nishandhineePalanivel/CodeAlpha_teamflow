import React from 'react';
import { Plus, Users, Settings, Search, Filter, BarChart3, Activity } from 'lucide-react';
import { Project, ProjectMember } from '../../types';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

interface ProjectHeaderProps {
  project: Project;
  members: ProjectMember[];
  onOpenInviteModal: () => void;
  onOpenSettingsModal: () => void;
  onAddTask: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPriority: string;
  setSelectedPriority: (priority: string) => void;
  selectedAssignee: string;
  setSelectedAssignee: (assignee: string) => void;
  activeTab: 'board' | 'stats' | 'activity';
  setActiveTab: (tab: 'board' | 'stats' | 'activity') => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  members,
  onOpenInviteModal,
  onOpenSettingsModal,
  onAddTask,
  searchQuery,
  setSearchQuery,
  selectedPriority,
  setSelectedPriority,
  selectedAssignee,
  setSelectedAssignee,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 md:p-6 space-y-4">
      {/* Top Title & Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: project.color }}
            ></span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {project.name}
            </h1>
          </div>
          {project.description && (
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Members Avatars Stack */}
          <div className="flex items-center -space-x-2 mr-2">
            {members.slice(0, 5).map((m) => (
              <Avatar key={m.id} name={m.user.name} src={m.user.avatar} size="sm" />
            ))}
            {members.length > 5 && (
              <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center border-2 border-white dark:border-slate-800">
                +{members.length - 5}
              </span>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={onOpenInviteModal}>
            <Users className="w-3.5 h-3.5" /> Members
          </Button>

          {project.currentUserRole !== 'MEMBER' && (
            <Button variant="outline" size="sm" onClick={onOpenSettingsModal}>
              <Settings className="w-3.5 h-3.5" /> Settings
            </Button>
          )}

          <Button size="sm" onClick={onAddTask}>
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        </div>
      </div>

      {/* Tabs & Filters Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('board')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'board'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Activity Stream
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 md:w-56"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Assignees</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
