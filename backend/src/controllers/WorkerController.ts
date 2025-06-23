import { Request, Response, NextFunction } from 'express';
import { WorkerService } from '../services/WorkerService';

export class WorkerController {
  private workerService: WorkerService;

  constructor() {
    this.workerService = new WorkerService();
    
    // 綁定 this 上下文
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  // 獲取所有工作者
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workers = await this.workerService.getAllWorkers();
      res.json({
        success: true,
        data: workers,
        count: workers.length
      });
    } catch (error) {
      next(error);
    }
  }

  // 根據ID獲取工作者
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const worker = await this.workerService.getWorkerById(parseInt(id));
      
      if (!worker) {
        res.status(404).json({
          success: false,
          message: 'Worker not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: worker
      });
    } catch (error) {
      next(error);
    }
  }

  // 創建新工作者
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { Name } = req.body;
      
      if (!Name || Name.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Name is required'
        });
        return;
      }
      
      const worker = await this.workerService.createWorker({ Name: Name.trim() });
      res.status(201).json({
        success: true,
        data: worker,
        message: 'Worker created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新工作者
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { Name } = req.body;
      
      if (!Name || Name.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Name is required'
        });
        return;
      }
      
      const worker = await this.workerService.updateWorker(parseInt(id), { Name: Name.trim() });
      
      if (!worker) {
        res.status(404).json({
          success: false,
          message: 'Worker not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: worker,
        message: 'Worker updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // 刪除工作者
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.workerService.deleteWorker(parseInt(id));
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Worker not found'
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'Worker deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
} 