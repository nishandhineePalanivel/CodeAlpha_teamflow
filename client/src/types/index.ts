export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: UserRole;
  joinedAt: string;
  user: User;
}

export interface Label {
  id: string;
  projectId: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string | null;
  assignee?: User | null;
  creatorId: string;
  creator?: User;
  dueDate?: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  labels: Label[];
  commentCount?: number;
  project?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  ownerId: string;
  owner?: User;
  members: ProjectMember[];
  taskCount?: number;
  completedTaskCount?: number;
  progress?: number;
  currentUserRole?: UserRole;
  labels?: Label[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'TASK_ASSIGNED' | 'PROJECT_INVITE' | 'COMMENT_MENTION' | 'TASK_UPDATE';
  title: string;
  message: string;
  relatedTaskId?: string | null;
  relatedProjectId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  user: User;
  action: string;
  entityType: 'TASK' | 'COMMENT' | 'MEMBER' | 'PROJECT';
  entityId?: string | null;
  metadata?: string | null;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface ProjectStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  doneTasks: number;
  overdueTasks: number;
  progressPercentage: number;
}
