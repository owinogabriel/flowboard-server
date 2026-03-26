import { Router } from 'express'
import { getWorkspaces, getWorkspaceById, createWorkspace, deleteWorkspace, updateWorkspace } from '../controllers/workspaceController.js'
import requireAuth from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas/workspaceSchema.js'

const router = Router()
router.use(requireAuth)

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: Get all workspaces for current user
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Workspace'
 */
router.get('/', getWorkspaces)

/**
 * @swagger
 * /api/workspaces/{id}:
 *   get:
 *     summary: Get a single workspace with members
 *     tags: [Workspaces]
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
 *         description: Workspace data with members
 *       403:
 *         description: Access denied
 *       404:
 *         description: Workspace not found
 */
router.get('/:id', getWorkspaceById)

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
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
 *                 example: My Workspace
 *               description:
 *                 type: string
 *                 example: Main workspace for my team
 *               color:
 *                 type: string
 *                 example: "#6366f1"
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', validate(createWorkspaceSchema), createWorkspace)

/**
 * @swagger
 * /api/workspaces/{id}:
 *   put:
 *     summary: Update a workspace
 *     tags: [Workspaces]
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
 *     responses:
 *       200:
 *         description: Workspace updated successfully
 *       403:
 *         description: Access denied
 */
router.put('/:id', validate(updateWorkspaceSchema), updateWorkspace)

/**
 * @swagger
 * /api/workspaces/{id}:
 *   delete:
 *     summary: Delete a workspace
 *     tags: [Workspaces]
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
 *         description: Workspace deleted successfully
 *       403:
 *         description: Access denied
 */
router.delete('/:id', deleteWorkspace)

export default router