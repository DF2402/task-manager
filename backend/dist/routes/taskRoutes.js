"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TaskController_1 = require("../controllers/TaskController");
const router = (0, express_1.Router)();
const taskController = new TaskController_1.TaskController();
// Task CRUD 路由
router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.get('/worker/:workerId', taskController.getByWorkerId);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.delete);
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map