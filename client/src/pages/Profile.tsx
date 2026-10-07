import React, { useState } from 'react';
import { User, Mail, Image, Key, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../stores/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import api from '../services/api';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setIsLoading(true);
      const res: any = await api.patch('/users/me', {
        name,
        email,
        avatar: avatar || null,
        password: password || undefined,
      });

      if (res.success && res.data) {
        updateUser(res.data);
        setSuccess('Profile updated successfully!');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">User Profile</h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Manage your personal information and security credentials
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 md:p-8 shadow-xs space-y-6">
        {/* Avatar Display Header */}
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-200 dark:border-slate-700">
          <Avatar name={user.name} src={avatar || user.avatar} size="lg" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl">{error}</div>}
          {success && <div className="p-3 bg-emerald-50 text-emerald-600 text-xs rounded-xl flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {success}</div>}

          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Avatar Image URL (DiceBear or Direct Image Link)"
            type="text"
            placeholder="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />

          <Input
            label="New Password (leave blank to keep current)"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="submit" isLoading={isLoading}>
              <Save className="w-4 h-4 mr-1" /> Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
