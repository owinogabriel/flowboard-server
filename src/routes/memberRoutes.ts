import { Router } from 'express'
import { addMember, removeMember, updateMemberRole } from '../controllers/memberController.js'
import requireAuth from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members:
 *   post:
 *     summary: Add a member to a workspace by email
 *     tags: [Members]
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
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: leon@email.com
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *                 example: member
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: User already a member
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.post('/:workspaceId/members', addMember)

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a workspace
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       403:
 *         description: Access denied
 */
router.delete('/:workspaceId/members/:userId', removeMember)

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members/{userId}:
 *   put:
 *     summary: Update a member's role
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       403:
 *         description: Access denied
 */
router.put('/:workspaceId/members/:userId', updateMemberRole)

export default router