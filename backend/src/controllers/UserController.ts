import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database/connection';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
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
      
            const user = await this.userService.updateUser(parseInt(id), {
                Name,
                Email,
                Password,
                Active
            });
      
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

  // Register new user
  async register(req: Request, res: Response) {
    const { username, password } = req.body;

    try {
      // Check if username already exists
      const userExists = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user with default role 'user'
      const result = await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
        [username, hashedPassword, 'user']
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    const { username, password } = req.body;

    try {
      // Find user
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = result.rows[0];

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        userId: user.id,
        username: user.username,
        role: user.role
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }

  // Get user profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const result = await pool.query(
        'SELECT id, username, role, created_at FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: 'Server error while fetching profile' });
    }
  }
} 