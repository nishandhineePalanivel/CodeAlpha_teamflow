import React, { useState, useEffect } from 'react';
import { Calendar, User as UserIcon, Tag, Clock, Edit3, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { Task, Comment, ProjectMember, TaskStatus, TaskPriority } from '../../types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { CommentList } from '../comment/CommentList';
import { CommentInput } from '../comment/CommentInput';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  members: ProjectMember[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onTaskUpdated?: () => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  taskId,
  members,
  onEditTask,
  onDeleteTask,
  onTaskUpdated,
}) => {
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    try {
      setIsLoading(true);
      const res: any = await api.get(`/tasks/${taskId}`);
      if (res.success && res.data) {
        setTask(res.data);
        setComments(res.data.comments || []);
      }
    } catch (err) {
      console.error('Error fetching task details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    }
  }, [isOpen, taskId]);

  useEffect(() => {
    if (!taskId) return;
    const socket = getSocket();

    const handleCommentCreated = (newComment: any) => {
      if (newComment.taskId === taskId) {
        setComments((prev) => [...prev, newComment]);
      }
    };

    const handleCommentUpdated = (updatedComment: Comment) => {
      if (updatedComment.taskId === taskId) {
        setComments((prev) => prev.map((c) => (c.id === updatedComment.id ? updatedComment : c)));
      }
    };

    const handleCommentDeleted = (data: { id: string; taskId: string }) => {
      if (data.taskId === taskId) {
        setComments((prev) => prev.filter((c) => c.id !== data.id));
      }
    };

    socket.on('comment:created', handleCommentCreated);
    socket.on('comment:updated', handleCommentUpdated);
    socket.on('comment:deleted', handleCommentDeleted);

    return () => {
      socket.off('comment:created', handleCommentCreated);
      socket.off('comment:updated', handleCommentUpdated);
      socket.off('comment:deleted', handleCommentDeleted);
    };
  }, [taskId]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    try {
      const res: any = await api.patch(`/tasks/${task.id}/move`, {
        status: newStatus,
        position: task.position,
      });
      if (res.success && res.data) {
        setTask((prev) => (prev ? { ...prev, status: newStatus } : null));
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (err) {
      console.error('Error changing task status:', err);
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (!task) return;
    try {
      const res: any = await api.patch(`/tasks/${task.id}`, { priority: newPriority });
      if (res.success && res.data) {
        setTask((prev) => (prev ? { ...prev, priority: newPriority } : null));
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (err) {
      console.error('Error changing task priority:', err);
    }
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    if (!task) return;
    try {
      const res: any = await api.patch(`/tasks/${task.id}`, {
        assigneeId: newAssigneeId || null,
      });
      if (res.success && res.data) {
        setTask(res.data);
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (err) {
      console.error('Error changing task assignee:', err);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!taskId) return;
    const res: any = await api.post(`/tasks/${taskId}/comments`, { content });
    if (res.success && res.data) {
      setComments((prev) => [...prev, res.data]);
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    const res: any = await api.patch(`/comments/${commentId}`, { content });
    if (res.success && res.data) {
      setComments((prev) => prev.map((c) => (c.id === commentId ? res.data : c)));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await api.delete(`/comments/${commentId}`);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  if (!isOpen || !task) return null;

  const isOverdue =
    task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date();

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="space-y-6">
        {/* Top Controls & Title */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {task.project?.name || 'Project Task'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{task.title}</h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onEditTask(task);
              }}
              className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Edit Task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this task?')) {
                  await onDeleteTask(task.id);
                  onClose();
                }
              }}
              className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Properties Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
          {/* Status */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Status
            </span>
            <select
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Priority
            </span>
            <select
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={task.priority}
              onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Assignee */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Assignee
            </span>
            <select
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate"
              value={task.assigneeId || ''}
              onChange={(e) => handleAssigneeChange(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Due Date
            </span>
            <div className={`flex items-center space-x-1 py-1 font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
              <span>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'No date'}
              </span>
            </div>
          </div>
        </div>

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Labels</h4>
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map((l) => (
                <span
                  key={l.id}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-xs"
                  style={{ backgroundColor: l.color }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Description</h4>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/50 text-sm text-slate-800 dark:text-slate-200 leading-relaxed min-h-[80px] whitespace-pre-wrap">
            {task.description || <span className="text-slate-400 italic">No description provided.</span>}
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Comments ({comments.length})
            </h3>
          </div>

          <CommentInput onSubmit={handleAddComment} />
          <CommentList comments={comments} onUpdate={handleUpdateComment} onDelete={handleDeleteComment} />
        </div>
      </div>
    </Modal>
  );
};
