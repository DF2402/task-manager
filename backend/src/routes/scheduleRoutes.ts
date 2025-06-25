import { Router } from 'express';
import { ScheduleController } from '../controllers/ScheduleController';

const router = Router();
const scheduleController = new ScheduleController();

// 排程路由
router.get('/', scheduleController.getAll);
router.get('/:id', scheduleController.getById);
router.get('/user/:userId', scheduleController.getByUserId);
router.post('/', scheduleController.create);
router.put('/:id', scheduleController.update);
router.delete('/:id', scheduleController.delete);

export default router; 