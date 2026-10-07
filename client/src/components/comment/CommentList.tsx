import React, { useState } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { Comment } from '../../types';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../stores/authStore';

interface CommentListProps {
  comments: Comment[];
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const CommentList: React.FC<CommentListProps> = ({ comments, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSave = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      setIsLoading(true);
      await onUpdate(id, editContent.trim());
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update comment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2">
          No comments yet. Be the first to start the conversation!
        </p>
      ) : (
        comments.map((c) => {
          const isOwner = user?.id === c.userId;
          const isEditing = editingId === c.id;

          return (
            <div key={c.id} className="flex items-start space-x-3 group">
              <Avatar name={c.user.name} src={c.user.avatar} size="sm" />

              <div className="flex-1 bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{c.user.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isOwner && !isEditing && (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                        <button
                          onClick={() => startEditing(c)}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          title="Edit comment"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDelete(c.id)}
                          className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="flex items-center space-x-2 justify-end">
                      <button
                        onClick={cancelEditing}
                        className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                      <button
                        onClick={() => handleSave(c.id)}
                        disabled={isLoading}
                        className="px-2.5 py-1 text-[11px] bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {c.content}
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
