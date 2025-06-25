import { Request, Response, NextFunction } from 'express';
import { ScheduleService } from '../services/ScheduleService';

export class ScheduleController {
  private scheduleService: ScheduleService;

  constructor() {
    this.scheduleService = new ScheduleService();
    
    // 綁定 this 上下文
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.getByUserId = this.getByUserId.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  // 獲取所有排程
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schedules = await this.scheduleService.getAllSchedules();
      res.json({
        success: true,
        data: schedules,
        count: schedules.length
      });
    } catch (error) {
      next(error);
    }
  }

  // 根據ID獲取排程
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const schedule = await this.scheduleService.getScheduleById(parseInt(id));
      
      if (!schedule) {
        res.status(404).json({
          success: false,
          message: 'Schedule not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: schedule
      });
    } catch (error) {
      next(error);
    }
  }

  // 根據用戶ID獲取排程
  async getByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const schedules = await this.scheduleService.getSchedulesByUserId(parseInt(userId));
      
      res.json({
        success: true,
        data: schedules,
        count: schedules.length
      });
    } catch (error) {
      next(error);
    }
  }

  // 創建新排程
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { User_Id, Date } = req.body;
      
      const schedule = await this.scheduleService.createSchedule({
        User_Id: User_Id ? parseInt(User_Id) : undefined,
        Date: Date || undefined
      });
      
      res.status(201).json({
        success: true,
        data: schedule,
        message: 'Schedule created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新排程
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { User_Id, Date } = req.body;
      
      const updateData: any = {};
      
      if (User_Id !== undefined) {
        updateData.User_Id = User_Id ? parseInt(User_Id) : null;
      }
      
      if (Date !== undefined) {
        updateData.Date = Date || null;
      }
      
      const schedule = await this.scheduleService.updateSchedule(parseInt(id), updateData);
      
      if (!schedule) {
        res.status(404).json({
          success: false,
          message: 'Schedule not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: schedule,
        message: 'Schedule updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // 刪除排程
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.scheduleService.deleteSchedule(parseInt(id));
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Schedule not found'
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'Schedule deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
} 