import { Router } from 'express'
import { getTasks, getTaskById, createTask, updateTask, deleteTask, addComment } from '../controllers/taskController.js'
import requireAuth from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createTaskSchema, updateTaskSchema } from '../schemas/taskSchema.js'

const router = Router()
router.use(requireAuth)

/**
 * @swagger
 * /api/tasks/project/{projectId}:
 *   get:
 *     summary: Get all tasks in a project with kanban grouping
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tasks list and kanban board
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 kanban:
 *                   type: object
 *                   properties:
 *                     todo:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *                     in_progress:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *                     completed:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 */
router.get('/project/:projectId', getTasks)

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task with comments
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task data with comments
 *       404:
 *         description: Task not found
 */
router.get('/:id', getTaskById)

/**
 * @swagger
 * /api/tasks/project/{projectId}:
 *   post:
 *     summary: Create a new task in a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Design homepage
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: high
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, completed]
 *                 example: todo
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-01T00:00:00.000Z"
 *               assigneeId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Task created successfully
 *       403:
 *         description: Access denied
 */
router.post('/project/:projectId', validate(createTaskSchema), createTask)

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, completed]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assigneeId:
 *                 type: integer
 *               position:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task updated
 *       404:
 *         description: Task not found
 */
router.put('/:id', validate(updateTaskSchema), updateTask)

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
router.delete('/:id', deleteTask)

/**
 * @swagger
 * /api/tasks/{id}/comments:
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: Great progress on this task!
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       404:
 *         description: Task not found
 */
router.post('/:id/comments', addComment)

export default router