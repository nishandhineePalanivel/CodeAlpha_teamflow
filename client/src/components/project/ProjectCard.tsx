import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Users } from 'lucide-react';
import { Project } from '../../types';
import { Avatar } from '../ui/Avatar';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-xl transition-all border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-4 group hover:-translate-y-0.5"
    >
      <div className="space-y-3">
        {/* Header Color & Name */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span
              className="w-4 h-4 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: project.color }}
            ></span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
              {project.name}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed">
          {project.description || 'No project description.'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Progress</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{project.progress || 0}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${project.progress || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
        {/* Member Avatar Group */}
        <div className="flex items-center -space-x-2 overflow-hidden">
          {project.members &&
            project.members.slice(0, 4).map((m) => (
              <Avatar key={m.id} name={m.user.name} src={m.user.avatar} size="xs" />
            ))}
          {project.members && project.members.length > 4 && (
            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-800">
              +{project.members.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 text-[11px] font-medium text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
          <span>{project.taskCount || 0} tasks</span>
        </div>
      </div>
    </Link>
  );
};
