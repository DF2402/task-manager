"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WorkerController_1 = require("../controllers/WorkerController");
const router = (0, express_1.Router)();
const workerController = new WorkerController_1.WorkerController();
// Worker CRUD 路由
router.get('/', workerController.getAll);
router.get('/:id', workerController.getById);
router.post('/', workerController.create);
router.put('/:id', workerController.update);
router.delete('/:id', workerController.delete);
exports.default = router;
//# sourceMappingURL=workerRoutes.js.map