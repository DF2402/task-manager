import { Router } from 'express';
import { FileController } from '../controllers/FileController';

const router = Router();
const fileController = new FileController();

// 檔案路由
router.get('/', fileController.getAll);
router.get('/:id', fileController.getById);
router.post('/', fileController.create);
router.put('/:id', fileController.update);
router.delete('/:id', fileController.delete);

export default router; 