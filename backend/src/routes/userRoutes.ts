import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
const userController = new UserController();

// Auth routes
router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));

// Protected routes
router.get('/profile', authenticateToken, userController.getProfile.bind(userController));

// 用戶 CRUD 路由
router.get('/', userController.getAll.bind(userController));
router.get('/:id', userController.getById.bind(userController));
router.post('/', userController.create.bind(userController));
router.put('/:id', userController.update.bind(userController));
router.delete('/:id', userController.delete.bind(userController));

// 用戶狀態管理路由
router.put('/:id/activate', userController.activate.bind(userController));
router.put('/:id/deactivate', userController.deactivate.bind(userController));

export default router; 