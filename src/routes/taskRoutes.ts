import { Router } from 'express'
import { getTasks, getTaskById, createTask, updateTask, deleteTask, addComment } from '../controllers/taskController.js'
import requireAuth from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createTaskSchema, updateTaskSchema } from '../schemas/taskSchema.js'

const router = Router()
router.use(requireAuth)

router.get('/project/:projectId', getTasks)
router.get('/:id', getTaskById)
router.post('/project/:projectId', validate(createTaskSchema), createTask)
router.put('/:id', validate(updateTaskSchema), updateTask)
router.delete('/:id', deleteTask)
router.post('/:id/comments', addComment)

export default router