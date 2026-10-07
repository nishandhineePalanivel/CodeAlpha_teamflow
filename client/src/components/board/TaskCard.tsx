import React from 'react';
import { MessageSquare, Calendar, AlertCircle } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue =
    task.dueDate &&
    task.status !== 'DONE' &&
    new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 cursor-pointer group select-none space-y-3"
    >
      {/* Task Labels & Priority */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap gap-1">
          {task.labels.map((l) => (
            <span
              key={l.id}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: l.color }}
            >
              {l.name}
            </span>
          ))}
        </div>
        <Badge priority={task.priority}>{task.priority}</Badge>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
        {task.title}
      </h4>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-xs">
        <div className="flex items-center space-x-3">
          {/* Due Date */}
          {task.dueDate && (
            <div
              className={`flex items-center space-x-1 ${
                isOverdue
                  ? 'text-red-600 font-bold dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded'
                  : ''
              }`}
              title={isOverdue ? 'Overdue task' : 'Due date'}
            >
              {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
              <span className="text-[11px]">
                {new Date(task.dueDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}

          {/* Comment Count */}
          {(task.commentCount !== undefined && task.commentCount > 0) && (
            <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">{task.commentCount}</span>
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignee ? (
          <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" />
        ) : (
          <span className="text-[10px] text-slate-400 italic">Unassigned</span>
        )}
      </div>
    </div>
  );
};
