import { Router } from 'express';
import { ScheduleController } from '../controllers/ScheduleController';

const router = Router();
const scheduleController = new ScheduleController();

// 日程 CRUD 路由
router.get('/', scheduleController.getAll.bind(scheduleController));
router.get('/:id', scheduleController.getById.bind(scheduleController));
router.post('/', scheduleController.create.bind(scheduleController));
router.put('/:id', scheduleController.update.bind(scheduleController));
router.delete('/:id', scheduleController.delete.bind(scheduleController));

// 根據用戶獲取日程
router.get('/user/:userId', scheduleController.getByUserId.bind(scheduleController));

// 根據日期獲取日程
router.get('/date/:date', scheduleController.getByDate.bind(scheduleController));

export default router; 