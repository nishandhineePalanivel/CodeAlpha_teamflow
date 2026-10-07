import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task, Project, ProjectMember, TaskStatus, Activity as ActivityType, ProjectStats } from '../types';
import api from '../services/api';
import { joinProjectRoom, leaveProjectRoom, getSocket } from '../services/socket';
import { ProjectHeader } from '../components/project/ProjectHeader';
import { TaskColumn } from '../components/board/TaskColumn';
import { TaskCard } from '../components/board/TaskCard';
import { TaskModal } from '../components/board/TaskModal';
import { TaskDetailsModal } from '../components/board/TaskDetailsModal';
import { MemberList } from '../components/project/MemberList';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { StatsCard } from '../components/dashboard/StatsCard';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'IN_REVIEW', title: 'In Review' },
  { id: 'DONE', title: 'Done' },
];

export const ProjectBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'board' | 'stats' | 'activity'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  // Modals State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [initialTaskStatus, setInitialTaskStatus] = useState<TaskStatus>('TODO');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Drag and Drop active item
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const fetchProjectData = async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const [projRes, tasksRes, membersRes, actRes, statsRes]: any[] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`),
        api.get(`/projects/${projectId}/members`),
        api.get(`/activity/projects/${projectId}/activity`),
        api.get(`/projects/${projectId}/stats`),
      ]);

      if (projRes.success) setProject(projRes.data);
      if (tasksRes.success) setTasks(tasksRes.data || []);
      if (membersRes.success) setMembers(membersRes.data || []);
      if (actRes.success) setActivities(actRes.data || []);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load project board:', err);
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  // Real-time WebSockets synchronization
  useEffect(() => {
    if (!projectId) return;

    joinProjectRoom(projectId);
    const socket = getSocket();

    const handleTaskCreated = (newTask: Task) => {
      setTasks((prev) => [newTask, ...prev.filter((t) => t.id !== newTask.id)]);
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    };

    const handleTaskMoved = (movedTask: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === movedTask.id ? movedTask : t)));
    };

    const handleTaskDeleted = (data: { id: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== data.id));
    };

    const handleMemberAdded = (newMember: ProjectMember) => {
      setMembers((prev) => [...prev, newMember]);
    };

    const handleActivityCreated = (newActivity: ActivityType) => {
      setActivities((prev) => [newActivity, ...prev]);
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:moved', handleTaskMoved);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('member:added', handleMemberAdded);
    socket.on('activity:created', handleActivityCreated);

    return () => {
      leaveProjectRoom(projectId);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:moved', handleTaskMoved);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('member:added', handleMemberAdded);
      socket.off('activity:created', handleActivityCreated);
    };
  }, [projectId]);

  // Drag & Drop Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const foundTask = tasks.find((t) => t.id === active.id);
    if (foundTask) setActiveTask(foundTask);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const currentTask = tasks.find((t) => t.id === activeId);
    if (!currentTask) return;

    // Check if target is a column status or another task
    let targetStatus: TaskStatus = currentTask.status;
    let newPosition = currentTask.position;

    const isOverColumn = COLUMNS.some((c) => c.id === overId);

    if (isOverColumn) {
      targetStatus = overId as TaskStatus;
      const tasksInTarget = tasks.filter((t) => t.status === targetStatus);
      newPosition = tasksInTarget.length > 0 ? Math.max(...tasksInTarget.map((t) => t.position)) + 1000 : 1000;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
        newPosition = overTask.position + 10;
      }
    }

    // Optimistic UI Update
    setTasks((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, status: targetStatus, position: newPosition } : t))
    );

    try {
      await api.patch(`/tasks/${activeId}/move`, {
        status: targetStatus,
        position: newPosition,
      });
    } catch (err) {
      console.error('Failed to move task persistence:', err);
      fetchProjectData();
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = !selectedPriority || t.priority === selectedPriority;
    const matchesAssignee = !selectedAssignee || t.assigneeId === selectedAssignee;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const handleCreateOrUpdateTask = async (taskData: any) => {
    if (editingTask) {
      await api.patch(`/tasks/${editingTask.id}`, taskData);
    } else {
      await api.post(`/projects/${projectId}/tasks`, taskData);
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskIdToDelete: string) => {
    await api.delete(`/tasks/${taskIdToDelete}`);
    setTasks((prev) => prev.filter((t) => t.id !== taskIdToDelete));
  };

  if (isLoading || !project) return <LoadingSpinner label="Loading project board..." />;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-fadeIn">
      {/* Project Header */}
      <ProjectHeader
        project={project}
        members={members}
        onOpenInviteModal={() => setIsMemberListOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onAddTask={() => {
          setEditingTask(null);
          setInitialTaskStatus('TODO');
          setIsTaskModalOpen(true);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        selectedAssignee={selectedAssignee}
        setSelectedAssignee={setSelectedAssignee}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Tab Views */}
      <div className="flex-1 p-4 md:p-6 overflow-x-auto">
        {activeTab === 'board' && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex space-x-4 items-start min-w-max pb-6">
              {COLUMNS.map((column) => {
                const columnTasks = filteredTasks.filter((t) => t.status === column.id);
                return (
                  <TaskColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    tasks={columnTasks}
                    onAddTask={(status) => {
                      setEditingTask(null);
                      setInitialTaskStatus(status);
                      setIsTaskModalOpen(true);
                    }}
                    onTaskClick={(task) => {
                      setSelectedTaskId(task.id);
                      setIsDetailsModalOpen(true);
                    }}
                  />
                );
              })}
            </div>

            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Analytics Tab View */}
        {activeTab === 'stats' && stats && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Project Progress Overview</h3>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Completion Percentage</span>
                <span className="text-indigo-600 dark:text-indigo-400">{stats.progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-4 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatsCard title="To Do" value={stats.todoTasks} icon={<span className="w-3 h-3 rounded-full bg-slate-400" />} color="indigo" />
              <StatsCard title="In Progress" value={stats.inProgressTasks} icon={<span className="w-3 h-3 rounded-full bg-blue-500" />} color="blue" />
              <StatsCard title="In Review" value={stats.inReviewTasks} icon={<span className="w-3 h-3 rounded-full bg-purple-500" />} color="amber" />
              <StatsCard title="Done" value={stats.doneTasks} icon={<span className="w-3 h-3 rounded-full bg-emerald-500" />} color="emerald" />
            </div>
          </div>
        )}

        {/* Activity Stream Tab View */}
        {activeTab === 'activity' && (
          <div className="max-w-3xl mx-auto">
            <RecentActivity activities={activities} />
          </div>
        )}
      </div>

      {/* Task Create/Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
        initialStatus={initialTaskStatus}
        initialTask={editingTask}
        members={members}
        labels={project.labels || []}
      />

      {/* Task Details & Live Comments Modal */}
      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedTaskId(null);
        }}
        taskId={selectedTaskId}
        members={members}
        onEditTask={(taskToEdit) => {
          setEditingTask(taskToEdit);
          setIsTaskModalOpen(true);
        }}
        onDeleteTask={handleDeleteTask}
        onTaskUpdated={fetchProjectData}
      />

      {/* Members Management Modal */}
      <MemberList
        isOpen={isMemberListOpen}
        onClose={() => setIsMemberListOpen(false)}
        projectId={project.id}
        members={members}
        ownerId={project.ownerId}
        currentUserRole={project.currentUserRole || 'MEMBER'}
        onMembersUpdated={fetchProjectData}
      />
    </div>
  );
};
