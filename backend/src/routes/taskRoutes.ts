import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';

const router = Router();
const taskController = new TaskController();

// Task CRUD 路由
router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.get('/user/:userId', taskController.getByUserId);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.delete);

export default router; 