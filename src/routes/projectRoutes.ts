import { Router } from 'express'
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/projectController.js'
import requireAuth from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createProjectSchema, updateProjectSchema } from '../schemas/projectSchema.js'

const router = Router()
router.use(requireAuth)

/**
 * @swagger
 * /api/projects/workspace/{workspaceId}:
 *   get:
 *     summary: Get all projects in a workspace
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of projects
 *       403:
 *         description: Access denied
 */
router.get('/workspace/:workspaceId', getProjects)

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a single project with task counts
 *     tags: [Projects]
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
 *         description: Project data with task counts
 *       404:
 *         description: Project not found
 */
router.get('/:id', getProjectById)

/**
 * @swagger
 * /api/projects/workspace/{workspaceId}:
 *   post:
 *     summary: Create a new project in a workspace
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Website Redesign
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *                 example: "#f59e0b"
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-01T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Project created successfully
 *       403:
 *         description: Access denied
 */
router.post('/workspace/:workspaceId', validate(createProjectSchema), createProject)

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Project updated
 *       403:
 *         description: Access denied
 */
router.put('/:id', validate(updateProjectSchema), updateProject)

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
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
 *         description: Project deleted
 *       403:
 *         description: Access denied
 */
router.delete('/:id', deleteProject)

export default router