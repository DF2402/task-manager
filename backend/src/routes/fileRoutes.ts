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

// 文件上傳路由
router.post('/upload', fileController.uploadMiddleware.array('files', 5), fileController.uploadFiles);

// 根據任務ID獲取文件
router.get('/task/:taskId', fileController.getFilesByTask);

// 文件下載路由
router.get('/download/:id', fileController.downloadFile);

export default router; 