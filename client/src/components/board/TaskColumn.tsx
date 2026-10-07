import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  id,
  title,
  tasks,
  onAddTask,
  onTaskClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const getHeaderColor = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return 'border-t-slate-400';
      case 'IN_PROGRESS':
        return 'border-t-blue-500';
      case 'IN_REVIEW':
        return 'border-t-purple-500';
      case 'DONE':
        return 'border-t-emerald-500';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`w-80 shrink-0 bg-slate-100/70 dark:bg-slate-900/60 rounded-xl p-3.5 flex flex-col border border-slate-200/80 dark:border-slate-800 border-t-4 ${getHeaderColor(
        id
      )} transition-colors min-h-[500px] ${isOver ? 'bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-500/40' : ''}`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {title}
          </h3>
          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold flex items-center justify-center">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onAddTask(id)}
          className="p-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          title="Add Task to column"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards Stream */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px] pr-0.5">
          {tasks.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-xs text-slate-400 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              Drop task here
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} onClick={onTaskClick} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
};
