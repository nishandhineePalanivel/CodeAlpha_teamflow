import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.activity.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.taskLabel.deleteMany({});
  await prisma.label.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('DemoPassword123!', 10);

  // 1. Create Demo Users
  const admin = await prisma.user.create({
    data: {
      name: 'Alex Rivera (Admin)',
      email: 'admin@teamflow.demo',
      passwordHash,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
  });

  const john = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@teamflow.demo',
      passwordHash,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    },
  });

  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'sarah@teamflow.demo',
      passwordHash,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
  });

  console.log('✅ Created demo users (admin, john, sarah)');

  // 2. Create Demo Project: Website Redesign
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete overhaul of company marketing website & customer dashboard',
      color: '#6366F1',
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'OWNER' },
          { userId: john.id, role: 'ADMIN' },
          { userId: sarah.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Create Labels for Project 1
  const labelFrontend = await prisma.label.create({
    data: { projectId: project1.id, name: 'Frontend', color: '#3B82F6' },
  });
  const labelBackend = await prisma.label.create({
    data: { projectId: project1.id, name: 'Backend', color: '#8B5CF6' },
  });
  const labelDesign = await prisma.label.create({
    data: { projectId: project1.id, name: 'Design', color: '#EC4899' },
  });
  const labelUrgent = await prisma.label.create({
    data: { projectId: project1.id, name: 'Urgent', color: '#EF4444' },
  });

  // 3. Create Tasks for Project 1
  const task1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Design new landing page wireframes',
      description: 'Create high-fidelity Figma mockups for hero section, features list, and call-to-action.',
      status: 'TODO',
      priority: 'HIGH',
      creatorId: admin.id,
      assigneeId: sarah.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      position: 1000,
      labels: {
        create: [{ labelId: labelDesign.id }],
      },
    },
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Implement API authentication with JWT',
      description: 'Set up login, register, token refresh, and protected route middlewares.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      creatorId: admin.id,
      assigneeId: john.id,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      position: 1000,
      labels: {
        create: [{ labelId: labelBackend.id }, { labelId: labelUrgent.id }],
      },
    },
  });

  const task3 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Build interactive Kanban dashboard UI',
      description: 'Implement column cards, drag and drop, and responsive mobile layouts.',
      status: 'IN_REVIEW',
      priority: 'MEDIUM',
      creatorId: john.id,
      assigneeId: admin.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      position: 1000,
      labels: {
        create: [{ labelId: labelFrontend.id }],
      },
    },
  });

  const task4 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Database schema & migration setup',
      description: 'Configure Prisma models for Users, Projects, Tasks, Comments, and Notifications.',
      status: 'DONE',
      priority: 'MEDIUM',
      creatorId: admin.id,
      assigneeId: john.id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      position: 1000,
      labels: {
        create: [{ labelId: labelBackend.id }],
      },
    },
  });

  // 4. Create Comments
  await prisma.comment.create({
    data: {
      taskId: task2.id,
      userId: sarah.id,
      content: "I've reviewed the token refresh logic. Looks super clean!",
    },
  });

  await prisma.comment.create({
    data: {
      taskId: task2.id,
      userId: john.id,
      content: "Thanks Sarah! Fixing the remaining middleware check now.",
    },
  });

  await prisma.comment.create({
    data: {
      taskId: task3.id,
      userId: admin.id,
      content: "The drag and drop feels very smooth! Ready for final QA.",
    },
  });

  // 5. Create Activity History
  await prisma.activity.createMany({
    data: [
      {
        projectId: project1.id,
        userId: admin.id,
        action: 'created project "Website Redesign"',
        entityType: 'PROJECT',
        entityId: project1.id,
      },
      {
        projectId: project1.id,
        userId: admin.id,
        action: 'added John Doe to project',
        entityType: 'MEMBER',
        entityId: john.id,
      },
      {
        projectId: project1.id,
        userId: john.id,
        action: 'moved "Implement API authentication with JWT" to IN_PROGRESS',
        entityType: 'TASK',
        entityId: task2.id,
      },
      {
        projectId: project1.id,
        userId: sarah.id,
        action: 'commented on "Implement API authentication with JWT"',
        entityType: 'COMMENT',
        entityId: task2.id,
      },
    ],
  });

  // 6. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: john.id,
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned',
        message: 'Alex assigned "Implement API authentication with JWT" to you',
        relatedTaskId: task2.id,
        relatedProjectId: project1.id,
        isRead: false,
      },
      {
        userId: sarah.id,
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned',
        message: 'Alex assigned "Design new landing page wireframes" to you',
        relatedTaskId: task1.id,
        relatedProjectId: project1.id,
        isRead: false,
      },
    ],
  });

  console.log('✅ Seeded demo project, tasks, comments, activity & notifications successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
