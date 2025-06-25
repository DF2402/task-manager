import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
    
    // 綁定 this 上下文
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
  }

  // 獲取所有用戶
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      next(error);
    }
  }

  // 根據ID獲取用戶
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(parseInt(id));
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // 創建新用戶
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { Name, Email, Password } = req.body;
      
      if (!Name || Name.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Name is required'
        });
        return;
      }
      
      if (!Password || Password.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Password is required'
        });
        return;
      }

      // 檢查 email 是否已存在
      if (Email) {
        const existingUser = await this.userService.getUserByEmail(Email);
        if (existingUser) {
          res.status(409).json({
            success: false,
            message: 'Email already exists'
          });
          return;
        }
      }
      
      const user = await this.userService.createUser({
        Name: Name.trim(),
        Email: Email?.trim() || undefined,
        Password: Password.trim()
      });
      
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新用戶
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { Name, Email, Password, Active } = req.body;
      
      const updateData: any = {};
      
      if (Name !== undefined) {
        if (Name.trim() === '') {
          res.status(400).json({
            success: false,
            message: 'Name cannot be empty'
          });
          return;
        }
        updateData.Name = Name.trim();
      }
      
      if (Email !== undefined) {
        updateData.Email = Email.trim() || null;
      }
      
      if (Password !== undefined) {
        if (Password.trim() === '') {
          res.status(400).json({
            success: false,
            message: 'Password cannot be empty'
          });
          return;
        }
        updateData.Password = Password.trim();
      }
      
      if (Active !== undefined) {
        updateData.Active = Boolean(Active);
      }
      
      const user = await this.userService.updateUser(parseInt(id), updateData);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // 刪除用戶
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.userService.deleteUser(parseInt(id));
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // 啟用用戶
  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.activateUser(parseInt(id));
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: user,
        message: 'User activated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // 停用用戶
  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.deactivateUser(parseInt(id));
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: user,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
} 