import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flowboard API',
      version: '1.0.0',
      description: `
## Flowboard Project Management API

A fully featured project management API with workspaces, projects, tasks and team collaboration.

### Getting Started
1. Register an account using **POST /api/auth/register**
2. Login using **POST /api/auth/login** to get your token
3. Click the **Authorize** button and enter: \`Bearer YOUR_TOKEN\`
4. You can now access all protected endpoints

### Features
- 🔐 JWT Authentication
- 🏢 Workspaces with team members
- 📋 Projects with deadlines
- ✅ Tasks with priorities, statuses and assignees
- 💬 Task comments
- 📊 Kanban board grouping
      `
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://flowboard-api-cbmg.onrender.com/',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token here'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Gabriel' },
            email: { type: 'string', example: 'gabriel@email.com' },
            avatar: { type: 'string', example: 'https://example.com/avatar.jpg', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Workspace: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'My Workspace' },
            description: { type: 'string', example: 'Main workspace', nullable: true },
            color: { type: 'string', example: '#6366f1' },
            ownerId: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Website Redesign' },
            description: { type: 'string', nullable: true },
            color: { type: 'string', example: '#f59e0b' },
            workspaceId: { type: 'integer', example: 1 },
            ownerId: { type: 'integer', example: 1 },
            deadline: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Design homepage' },
            description: { type: 'string', nullable: true },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
            status: { type: 'string', enum: ['todo', 'in_progress', 'completed'], example: 'todo' },
            position: { type: 'integer', example: 0 },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            projectId: { type: 'integer', example: 1 },
            assigneeId: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            content: { type: 'string', example: 'Great progress!' },
            taskId: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong' }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email address' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
}

const swaggerSpec = swaggerJsdoc(options)

export default swaggerSpec