import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button';

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
}

export const CommentInput: React.FC<CommentInputProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsLoading(true);
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all min-h-[80px]"
        placeholder="Write a comment... (multiline text supported)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" isLoading={isLoading} disabled={!content.trim()}>
          <Send className="w-3.5 h-3.5 mr-1" /> Comment
        </Button>
      </div>
    </form>
  );
};
