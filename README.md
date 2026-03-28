# Flowboard API 🚀

A fully featured **Project Management REST API** built with Node.js, Express, TypeScript, Drizzle ORM and PostgreSQL.

## Live API
```
https://flowboard-api-cbmg.onrender.com/
```

## API Documentation
```
https://flowboard-api-cbmg.onrender.com/api/docs
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js + Express | Server framework |
| TypeScript | Type safety |
| PostgreSQL | Database |
| Drizzle ORM | Database ORM |
| JWT | Authentication |
| Bcrypt | Password hashing |
| Zod | Input validation |
| Swagger | API documentation |

---

## Features

- 🔐 **JWT Authentication** — Register, login, protected routes
- 🏢 **Workspaces** — Create and manage team workspaces
- 👥 **Members** — Invite members with role-based access (owner, admin, member)
- 📋 **Projects** — Create projects with deadlines and colors
- ✅ **Tasks** — Full task management with priorities, statuses and assignees
- 📊 **Kanban** — Tasks grouped by status for kanban board rendering
- 💬 **Comments** — Add comments to tasks
- 📄 **Swagger Docs** — Interactive API documentation

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/flowboard-server.git
cd flowboard-server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
JWT_SECRET=your_jwt_secret_key
DATABASE_URL="postgresql://postgres:password@localhost:5432/flowboard"
CLIENT_URL="http://localhost:3001"
NODE_ENV=development
```

### Database Setup

```bash
# Create database
sudo -u postgres psql -c "CREATE DATABASE flowboard;"

# Push schema to database
npm run db:push

# (Optional) Open Drizzle Studio
npm run db:studio
```

### Running the Server

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get token | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/me` | Update profile | Yes |

### Workspaces
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/workspaces` | Get all workspaces | Yes |
| GET | `/api/workspaces/:id` | Get workspace with members | Yes |
| POST | `/api/workspaces` | Create workspace | Yes |
| PUT | `/api/workspaces/:id` | Update workspace | Yes |
| DELETE | `/api/workspaces/:id` | Delete workspace | Yes |

### Members
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/workspaces/:id/members` | Add member by email | Yes |
| PUT | `/api/workspaces/:id/members/:userId` | Update member role | Yes |
| DELETE | `/api/workspaces/:id/members/:userId` | Remove member | Yes |

### Projects
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects/workspace/:workspaceId` | Get projects in workspace | Yes |
| GET | `/api/projects/:id` | Get project with task counts | Yes |
| POST | `/api/projects/workspace/:workspaceId` | Create project | Yes |
| PUT | `/api/projects/:id` | Update project | Yes |
| DELETE | `/api/projects/:id` | Delete project | Yes |

### Tasks
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks/project/:projectId` | Get tasks with kanban grouping | Yes |
| GET | `/api/tasks/:id` | Get task with comments | Yes |
| POST | `/api/tasks/project/:projectId` | Create task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |
| POST | `/api/tasks/:id/comments` | Add comment | Yes |

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

Get your token by registering or logging in.

---

## Request & Response Examples

### Register
```json
POST /api/auth/register

// Request
{
  "name": "Gabriel",
  "email": "gabriel@email.com",
  "password": "password123"
}

// Response 201
{
  "success": true,
  "message": "Account created successfully!",
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "name": "Gabriel",
    "email": "gabriel@email.com"
  }
}
```

### Create Workspace
```json
POST /api/workspaces

// Request
{
  "name": "My Workspace",
  "description": "Main workspace for my team",
  "color": "#6366f1"
}

// Response 201
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My Workspace",
    "color": "#6366f1",
    "ownerId": 1,
    "createdAt": "2026-03-28T..."
  }
}
```

### Create Task
```json
POST /api/tasks/project/1

// Request
{
  "title": "Design homepage",
  "description": "Create wireframes for the homepage",
  "priority": "high",
  "status": "todo",
  "dueDate": "2026-04-01T00:00:00.000Z",
  "assigneeId": 2
}

// Response 201
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Design homepage",
    "priority": "high",
    "status": "todo",
    "projectId": 1,
    "createdAt": "2026-03-28T..."
  }
}
```

### Get Tasks (Kanban)
```json
GET /api/tasks/project/1

// Response 200
{
  "success": true,
  "data": [...],
  "kanban": {
    "todo": [{ "id": 1, "title": "Design homepage", "priority": "high" }],
    "in_progress": [],
    "completed": []
  }
}
```

---

## Database Schema

```
users
  ├── id, name, email, password, avatar
  └── timestamps

workspaces
  ├── id, name, description, color, ownerId
  └── timestamps

workspace_members
  ├── id, workspaceId, userId, role (owner/admin/member)
  └── joinedAt

projects
  ├── id, name, description, color, workspaceId, ownerId, deadline
  └── timestamps

tasks
  ├── id, title, description, priority, status, position
  ├── dueDate, projectId, assigneeId, createdById
  └── timestamps

comments
  ├── id, content, taskId, userId
  └── createdAt
```

---

## Project Structure

```
src/
  index.ts              # Entry point
  swagger.ts            # API documentation config
  db/
    index.ts            # Database connection
    schema.ts           # Drizzle schema
  controllers/
    authController.ts
    workspaceController.ts
    projectController.ts
    taskController.ts
    memberController.ts
  routes/
    authRoutes.ts
    workspaceRoutes.ts
    projectRoutes.ts
    taskRoutes.ts
    memberRoutes.ts
  middleware/
    auth.ts             # JWT middleware
    validate.ts         # Zod validation middleware
    logger.ts           # Request logger
    errorHandler.ts     # Global error handler
  schemas/
    authSchemas.ts
    workspaceSchemas.ts
    projectSchemas.ts
    taskSchemas.ts
  types/
    index.ts            # Custom TypeScript types
```

---

## Deployment

This API is deployed on **Render** with a managed PostgreSQL database.

### Deploy your own

1. Fork this repository
2. Create a new Web Service on [Render](https://render.com)
3. Connect your GitHub repo
4. Set environment variables
5. Set build command: `npm install && npm run build`
6. Set start command: `npm start`
7. Create a PostgreSQL database on Render
8. Connect the Internal Database URL to your web service

---

## Frontend

The frontend client for this API is available at:
[flowboard-web](https://github.com/owinogabrie/flowboard-web)

---

## License

MIT
