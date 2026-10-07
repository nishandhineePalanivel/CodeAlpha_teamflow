import React, { useState } from 'react';
import { UserPlus, Shield, Trash2 } from 'lucide-react';
import { ProjectMember, UserRole } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import api from '../../services/api';

interface MemberListProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: ProjectMember[];
  ownerId: string;
  currentUserRole: UserRole;
  onMembersUpdated: () => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  isOpen,
  onClose,
  projectId,
  members,
  ownerId,
  currentUserRole,
  onMembersUpdated,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('MEMBER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      const res: any = await api.post(`/projects/${projectId}/members`, {
        email: email.trim(),
        role,
      });
      if (res.success) {
        setSuccess(`Successfully added ${email} to project!`);
        setEmail('');
        onMembersUpdated();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await api.patch(`/projects/${projectId}/members/${userId}`, { role: newRole });
      onMembersUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to change role');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      onMembersUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Members"
      description="Manage team members and permission roles"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Add Member Form */}
        {(currentUserRole === 'OWNER' || currentUserRole === 'ADMIN') && (
          <form onSubmit={handleAddMember} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-indigo-600" /> Invite New Member
            </h4>

            {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{error}</p>}
            {success && <p className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded">{success}</p>}

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter email (e.g. john@teamflow.demo)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <select
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>

              <Button type="submit" isLoading={isLoading} size="sm">
                Add
              </Button>
            </div>
          </form>
        )}

        {/* Member Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Current Members ({members.length})
          </h4>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {members.map((m) => {
              const isOwner = m.userId === ownerId;
              const canEditRole = currentUserRole === 'OWNER' && !isOwner;
              const canRemove = (currentUserRole === 'OWNER' || currentUserRole === 'ADMIN') && !isOwner;

              return (
                <div key={m.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Avatar name={m.user.name} src={m.user.avatar} size="md" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {m.user.name}
                        {isOwner && (
                          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 px-1.5 py-0.5 rounded">
                            OWNER
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {canEditRole ? (
                      <select
                        className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200"
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.userId, e.target.value as UserRole)}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MEMBER">MEMBER</option>
                      </select>
                    ) : (
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {m.role}
                      </span>
                    )}

                    {canRemove && (
                      <button
                        onClick={() => handleRemoveMember(m.userId)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
