import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/TaskService';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
    
    // 綁定 this 上下文
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.getByUserId = this.getByUserId.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.markInProgress = this.markInProgress.bind(this);
    this.markForReview = this.markForReview.bind(this);
    this.markDone = this.markDone.bind(this);
  }

  // 獲取所有任務
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await this.taskService.getAllTasks();
      res.json({
        success: true,
        data: tasks,
        count: tasks.length
      });
    } catch (error) {
      next(error);
    }
  }

  // 根據ID獲取任務
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error) {
      next(error);
    }
  }

  // 根據用戶ID獲取任務
  async getByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const tasks = await this.taskService.getTasksByUserId(parseInt(userId));
      
      res.json({
        success: true,
        data: tasks,
        count: tasks.length
      });
    } catch (error) {
      next(error);
    }
  }

  // 創建新任務
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { Content, User_Id, Work_in_progress, To_review, Done } = req.body;
      
      if (!Content || Content.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Content is required'
        });
        return;
      }

      if (!User_Id) {
        res.status(400).json({
          success: false,
          message: 'User_Id is required'
        });
        return;
      }
      
      const task = await this.taskService.createTask({
        Content: Content.trim(),
        User_Id: parseInt(User_Id),
        Work_in_progress: Boolean(Work_in_progress),
        To_review: Boolean(To_review),
        Done: Boolean(Done)
      });
      
      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新任務
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { Content, User_Id, Work_in_progress, To_review, Done } = req.body;
      
      const task = await this.taskService.updateTask(parseInt(id), {
        Content,
        User_Id: User_Id ? parseInt(User_Id) : undefined,
        Work_in_progress,
        To_review,
        Done
      });
      
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
    } catch (error) {
      next(error);
    }
  }

  // 刪除任務
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error) {
      next(error);
    }
  }

  // 標記任務為進行中
  async markInProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const task = await this.taskService.markTaskInProgress(parseInt(id));
      
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
        message: 'Task marked as in progress'
      });
    } catch (error) {
      next(error);
    }
  }

  // 標記任務為待審核
  async markForReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const task = await this.taskService.markTaskForReview(parseInt(id));
      
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
        message: 'Task marked for review'
      });
    } catch (error) {
      next(error);
    }
  }

  // 標記任務為完成
  async markDone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const task = await this.taskService.markTaskDone(parseInt(id));
      
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
        message: 'Task marked as done'
      });
    } catch (error) {
      next(error);
    }
  }
} 