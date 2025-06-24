"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const TaskService_1 = require("../services/TaskService");
class TaskController {
    constructor() {
        this.taskService = new TaskService_1.TaskService();
        // 綁定 this 上下文
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.getByWorkerId = this.getByWorkerId.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }
    // 獲取所有任務
    async getAll(req, res, next) {
        try {
            const tasks = await this.taskService.getAllTasks();
            res.json({
                success: true,
                data: tasks,
                count: tasks.length
            });
        }
        catch (error) {
            next(error);
        }
    }
    // 根據ID獲取任務
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const task = await this.taskService.getTaskById(parseInt(id));
            if (!task) {
                res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
                return;
            }
            res.json({
                success: true,
                data: task
            });
        }
        catch (error) {
            next(error);
        }
    }
    // 根據工作者ID獲取任務
    async getByWorkerId(req, res, next) {
        try {
            const { workerId } = req.params;
            const tasks = await this.taskService.getTasksByWorkerId(parseInt(workerId));
            res.json({
                success: true,
                data: tasks,
                count: tasks.length
            });
        }
        catch (error) {
            next(error);
        }
    }
    // 創建新任務
    async create(req, res, next) {
        try {
            const { Content, Worker_Id } = req.body;
            if (!Content || Content.trim() === '') {
                res.status(400).json({
                    success: false,
                    message: 'Content is required'
                });
                return;
            }
            if (!Worker_Id || isNaN(parseInt(Worker_Id))) {
                res.status(400).json({
                    success: false,
                    message: 'Valid Worker_Id is required'
                });
                return;
            }
            const task = await this.taskService.createTask({
                Content: Content.trim(),
                Worker_Id: parseInt(Worker_Id)
            });
            res.status(201).json({
                success: true,
                data: task,
                message: 'Task created successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    // 更新任務
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { Content, Worker_Id, Work_in_progress, To_review, Done } = req.body;
            const updateData = {};
            if (Content !== undefined) {
                if (Content.trim() === '') {
                    res.status(400).json({
                        success: false,
                        message: 'Content cannot be empty'
                    });
                    return;
                }
                updateData.Content = Content.trim();
            }
            if (Worker_Id !== undefined) {
                updateData.Worker_Id = parseInt(Worker_Id);
            }
            if (Work_in_progress !== undefined) {
                updateData.Work_in_progress = Boolean(Work_in_progress);
            }
            if (To_review !== undefined) {
                updateData.To_review = Boolean(To_review);
            }
            if (Done !== undefined) {
                updateData.Done = Boolean(Done);
            }
            const task = await this.taskService.updateTask(parseInt(id), updateData);
            if (!task) {
                res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
                return;
            }
            res.json({
                success: true,
                data: task,
                message: 'Task updated successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    // 刪除任務
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const success = await this.taskService.deleteTask(parseInt(id));
            if (!success) {
                res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Task deleted successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TaskController = TaskController;
//# sourceMappingURL=TaskController.js.map