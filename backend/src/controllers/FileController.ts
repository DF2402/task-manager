import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services/FileService';

export class FileController {
  private fileService: FileService;

  constructor() {
    this.fileService = new FileService();
    
    // 綁定 this 上下文
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  // 獲取所有檔案
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = await this.fileService.getAllFiles();
      res.json({
        success: true,
        data: files,
        count: files.length
      });
    } catch (error) {
      next(error);
    }
  }

  // 根據ID獲取檔案
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const file = await this.fileService.getFileById(parseInt(id));
      
      if (!file) {
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: file
      });
    } catch (error) {
      next(error);
    }
  }

  // 創建新檔案記錄
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { File_Name, File_Path, File_Type, File_Size } = req.body;
      
      if (!File_Name || File_Name.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'File_Name is required'
        });
        return;
      }
      
      if (!File_Path || File_Path.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'File_Path is required'
        });
        return;
      }
      
      if (!File_Type || File_Type.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'File_Type is required'
        });
        return;
      }
      
      if (File_Size === undefined || isNaN(parseInt(File_Size))) {
        res.status(400).json({
          success: false,
          message: 'Valid File_Size is required'
        });
        return;
      }
      
      const file = await this.fileService.createFile({
        File_Name: File_Name.trim(),
        File_Path: File_Path.trim(),
        File_Type: File_Type.trim(),
        File_Size: parseInt(File_Size)
      });
      
      res.status(201).json({
        success: true,
        data: file,
        message: 'File created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新檔案記錄
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { File_Name, File_Path, File_Type, File_Size } = req.body;
      
      const updateData: any = {};
      
      if (File_Name !== undefined) {
        if (File_Name.trim() === '') {
          res.status(400).json({
            success: false,
            message: 'File_Name cannot be empty'
          });
          return;
        }
        updateData.File_Name = File_Name.trim();
      }
      
      if (File_Path !== undefined) {
        if (File_Path.trim() === '') {
          res.status(400).json({
            success: false,
            message: 'File_Path cannot be empty'
          });
          return;
        }
        updateData.File_Path = File_Path.trim();
      }
      
      if (File_Type !== undefined) {
        if (File_Type.trim() === '') {
          res.status(400).json({
            success: false,
            message: 'File_Type cannot be empty'
          });
          return;
        }
        updateData.File_Type = File_Type.trim();
      }
      
      if (File_Size !== undefined) {
        updateData.File_Size = parseInt(File_Size);
      }
      
      const file = await this.fileService.updateFile(parseInt(id), updateData);
      
      if (!file) {
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: file,
        message: 'File updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // 刪除檔案記錄
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.fileService.deleteFile(parseInt(id));
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
} 