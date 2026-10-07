# TeamFlow — Plan. Collaborate. Get Things Done.

TeamFlow is a full-stack, real-time collaborative project management application inspired by Trello and Asana. It provides team-based project workspaces, interactive drag-and-drop Kanban boards, real-time Socket.IO synchronization, task assignment & comments, activity timelines, notifications, statistics analytics, and dark mode.

---

## 🚀 Key Features

1. **Authentication & Authorization**
   - User registration, login, logout, profile management with avatar customizer.
   - Role-based authorization (`OWNER`, `ADMIN`, `MEMBER`) for projects and action permissions.
   - Quick one-click demo credentials login buttons on the login screen.

2. **Project Workspace Management**
   - Create, edit, and delete projects with customizable color badges and metadata.
   - Invite members by email with role assignment (`ADMIN`, `MEMBER`).
   - Project statistics breakdown (completion %, task distribution by status and priority, overdue metrics).

3. **Interactive Drag-and-Drop Kanban Board**
   - Columns: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`.
   - Real-time drag and drop powered by `@dnd-kit`.
   - Instant position and status updates persisted directly in the database.

4. **Task Management & Filtering**
   - Task priorities: `LOW`, `MEDIUM`, `HIGH`, `URGENT` with requirement-compliant badge colors.
   - Due dates with automatic overdue indicator badges.
   - Assign tasks to project team members.
   - Custom project labels/tags (`Frontend`, `Backend`, `Design`, `Bug`, `Documentation`).
   - Live searching by task title/description and multi-column filtering.

5. **Real-Time WebSockets Communication**
   - Built on Socket.IO project rooms (`project:${projectId}`).
   - Instant multi-user updates for task creation, movement, updates, deletion, comments, and member additions without needing to refresh the page.

6. **Task Comments & Activity Timeline**
   - Multiline comment input with edit and delete capabilities for comment authors.
   - Comprehensive audit activity stream recording user actions (task creation, status change, member addition, comment posting).

7. **Notification System**
   - Navbar bell icon with unread counter badge.
   - Live socket notification triggers when assigned to tasks or added to projects.
   - Mark individual or all notifications as read.

8. **Polished SaaS UI/UX**
   - Clean aesthetic using Tailwind CSS and Lucide React icons.
   - Dark Mode, Light Mode, and System Theme preferences with persistent state.
   - Fully responsive on desktop, tablet, and mobile with bottom navigation bar.

---

## 🛠️ Recommended Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack React Query, `@dnd-kit`, Lucide React icons, Axios, React Router v6.
- **Backend**: Node.js, Express.js, TypeScript, Socket.IO.
- **Database & ORM**: PostgreSQL / SQLite, Prisma ORM.
- **Authentication**: JWT, bcryptjs password hashing.
- **Testing**: Vitest, Supertest integration testing.

---

## 📁 Repository Structure

```
teamflow/
├── client/                 # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── api/            # API services & helpers
│   │   ├── components/     # UI primitives, board, project, comment, layout
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Dashboard, Projects, ProjectBoard, MyTasks, etc.
│   │   ├── services/       # Axios client & Socket.IO service
│   │   ├── stores/         # Auth & Theme state management
│   │   ├── types/          # TypeScript definitions
│   │   └── App.tsx         # Router configuration & guards
│   └── package.json
├── server/                 # Express + Socket.IO Node Backend
│   ├── src/
│   │   ├── controllers/    # Express route controllers
│   │   ├── middleware/     # Auth, validation, project role guards
│   │   ├── routes/         # API endpoints mapping
│   │   ├── services/       # Activity, Notification, Socket handlers
│   │   ├── sockets/        # Socket.IO event handler
│   │   ├── validators/     # Zod request validators
│   │   └── server.ts       # Server entry point
│   └── package.json
├── prisma/
│   ├── schema.prisma       # Database schema definition
│   └── seed.ts             # Demo data seed script
├── .env.example
├── .env
├── package.json            # Root workspace scripts
└── README.md
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory (copied from `.env.example`):

```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="teamflow-super-secret-jwt-key-2026-production"
CLIENT_URL="http://localhost:5173"
SERVER_URL="http://localhost:5000"
NODE_ENV="development"
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
cd ..
```

### 2. Database Migration & Push
```bash
npx prisma db push --schema=./prisma/schema.prisma
```

### 3. Seed Demo Data
```bash
npx ts-node prisma/seed.ts
```

### 4. Run Development Servers
```bash
# Run backend server (Port 5000)
npm run dev:server

# In a separate terminal, run frontend client (Port 5173)
npm run dev:client
```
Or run both concurrently from the root directory:
```bash
npm run dev
```

---

## 🔑 Demo Account Credentials

Use these pre-seeded demo accounts to test real-time collaboration between two browser windows:

| User | Email | Password | Role in Demo Project |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@teamflow.demo` | `DemoPassword123!` | OWNER |
| **John Doe** | `john@teamflow.demo` | `DemoPassword123!` | ADMIN |
| **Sarah Connor** | `sarah@teamflow.demo` | `DemoPassword123!` | MEMBER |

---

## 🧪 Testing

Run API integration test suite with Vitest:

```bash
npm run test
```

---

## 📡 API Overview

### Auth
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Login user
- `GET /api/auth/me` — Get current user profile
- `POST /api/auth/logout` — End session

### Projects & Members
- `GET /api/projects` — List user projects
- `POST /api/projects` — Create project
- `GET /api/projects/:id` — Get single project details
- `PATCH /api/projects/:id` — Update project metadata
- `DELETE /api/projects/:id` — Delete project
- `POST /api/projects/:id/members` — Add member to project
- `DELETE /api/projects/:id/members/:userId` — Remove member

### Tasks & Drag-and-Drop
- `GET /api/projects/:projectId/tasks` — List project tasks
- `POST /api/projects/:projectId/tasks` — Create task
- `PATCH /api/tasks/:id` — Update task details
- `PATCH /api/tasks/:id/move` — Drag-and-drop move task position & status
- `DELETE /api/tasks/:id` — Delete task

### Comments & Notifications
- `GET /api/tasks/:taskId/comments` — Get task comments
- `POST /api/tasks/:taskId/comments` — Add comment to task
- `GET /api/notifications` — Get user notifications
- `PATCH /api/notifications/read-all` — Mark all as read
