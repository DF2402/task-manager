import { Router } from 'express';
import { AttendanceController } from '../controllers/AttendanceController';

const router = Router();
const attendanceController = new AttendanceController();

// 考勤記錄路由
router.get('/', attendanceController.getAll.bind(attendanceController));
router.get('/worker/:workerId', attendanceController.getByWorkerId.bind(attendanceController));

export default router; 