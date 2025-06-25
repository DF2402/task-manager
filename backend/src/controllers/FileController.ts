import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { FileService } from '../services/FileService';

// 配置 multer 存儲
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // 確保目錄存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：時間戳_原文件名
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${sanitizedName}`);
  }
});

// 文件過濾器
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 允許的文件類型
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
  }
};

// 配置 multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 限制
    files: 5 // 最多 5 個文件
  }
});

export class FileController {
  private fileService: FileService;
  public uploadMiddleware: multer.Multer;

  constructor() {
    this.fileService = new FileService();
    this.uploadMiddleware = upload;
    
    // 綁定 this 上下文
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.getFilesByTask = this.getFilesByTask.bind(this);
    this.downloadFile = this.downloadFile.bind(this);
  }

  // 文件上傳處理
  async uploadFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      const { taskId } = req.body;

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
        return;
      }

      if (!taskId) {
        res.status(400).json({
          success: false,
          message: 'Task ID is required'
        });
        return;
      }

      const uploadedFiles = [];

      // 為每個上傳的文件創建數據庫記錄
      for (const file of files) {
        const fileRecord = await this.fileService.createFileWithTask({
          File_Name: file.originalname,
          File_Path: file.path,
          File_Type: file.mimetype,
          File_Size: file.size,
          Task_Id: parseInt(taskId)
        });
        uploadedFiles.push(fileRecord);
      }

      res.status(201).json({
        success: true,
        data: uploadedFiles,
        message: `Successfully uploaded ${files.length} file(s)`,
        count: files.length
      });
    } catch (error) {
      // 如果出錯，清理已上傳的文件
      if (req.files) {
        const files = req.files as Express.Multer.File[];
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      next(error);
    }
  }

  // 根據任務ID獲取文件
  async getFilesByTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      const files = await this.fileService.getFilesByTaskId(parseInt(taskId));
      
      res.json({
        success: true,
        data: files,
        count: files.length
      });
    } catch (error) {
      next(error);
    }
  }

  // 文件下載
  async downloadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const filePath = file.File_Path;
      
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'Physical file not found'
        });
        return;
      }

      // 設置響應頭
      res.setHeader('Content-Disposition', `attachment; filename="${file.File_Name}"`);
      res.setHeader('Content-Type', file.File_Type);
      
      // 發送文件
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      next(error);
    }
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
      const file = await this.fileService.getFileById(parseInt(id));
      
      if (!file) {
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
        return;
      }

      // 刪除物理文件
      if (fs.existsSync(file.File_Path)) {
        fs.unlinkSync(file.File_Path);
      }

      // 刪除數據庫記錄
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