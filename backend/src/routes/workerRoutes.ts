import { Router } from 'express';
import { WorkerController } from '../controllers/WorkerController';

const router = Router();
const workerController = new WorkerController();

// Worker CRUD 路由
router.get('/', workerController.getAll);
router.get('/:id', workerController.getById);
router.post('/', workerController.create);
router.put('/:id', workerController.update);
router.delete('/:id', workerController.delete);

export default router; 