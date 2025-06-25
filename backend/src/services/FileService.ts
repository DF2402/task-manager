import { DatabaseConnection } from '../database/connection';
import { File, CreateFileRequest, UpdateFileRequest } from '../models/file';

// 添加新的接口類型
interface CreateFileWithTaskRequest extends CreateFileRequest {
  Task_Id: number;
}

export class FileService {
  private getDb() {
    return DatabaseConnection.getInstance();
  }

  async getAllFiles(): Promise<File[]> {
    return new Promise((resolve, reject) => {
      this.getDb().all('SELECT * FROM File ORDER BY Created_At DESC', (err: any, rows: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as File[]);
        }
      });
    });
  }

  async getFileById(id: number): Promise<File | null> {
    return new Promise((resolve, reject) => {
      this.getDb().get('SELECT * FROM File WHERE id = ?', [id], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as File || null);
        }
      });
    });
  }

  // 根據任務ID獲取文件
  async getFilesByTaskId(taskId: number): Promise<File[]> {
    return new Promise((resolve, reject) => {
      this.getDb().all(
        `SELECT f.* FROM File f 
         INNER JOIN Upload u ON f.id = u.File_Id 
         WHERE u.Task_Id = ? 
         ORDER BY f.Created_At DESC`,
        [taskId],
        (err: any, rows: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as File[]);
          }
        }
      );
    });
  }

  async createFile(data: CreateFileRequest): Promise<File> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      this.getDb().run(
        'INSERT INTO File (File_Name, File_Path, File_Type, File_Size, Created_At, Updated_At) VALUES (?, ?, ?, ?, ?, ?)',
        [data.File_Name, data.File_Path, data.File_Type, data.File_Size, now, now],
        function(this: any, err: any) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              File_Name: data.File_Name,
              File_Path: data.File_Path,
              File_Type: data.File_Type,
              File_Size: data.File_Size,
              Created_At: now,
              Updated_At: now
            });
          }
        }
      );
    });
  }

  // 創建文件並關聯到任務
  async createFileWithTask(data: CreateFileWithTaskRequest): Promise<File> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      const now = new Date().toISOString();
      
      // 開始事務
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // 插入文件記錄
        db.run(
          'INSERT INTO File (File_Name, File_Path, File_Type, File_Size, Created_At, Updated_At) VALUES (?, ?, ?, ?, ?, ?)',
          [data.File_Name, data.File_Path, data.File_Type, data.File_Size, now, now],
          function(this: any, err: any) {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            const fileId = this.lastID;
            
            // 插入上傳關聯記錄
            db.run(
              'INSERT INTO Upload (Task_Id, File_Id, Created_At) VALUES (?, ?, ?)',
              [data.Task_Id, fileId, now],
              function(this: any, uploadErr: any) {
                if (uploadErr) {
                  db.run('ROLLBACK');
                  reject(uploadErr);
                  return;
                }
                
                db.run('COMMIT');
                resolve({
                  id: fileId,
                  File_Name: data.File_Name,
                  File_Path: data.File_Path,
                  File_Type: data.File_Type,
                  File_Size: data.File_Size,
                  Created_At: now,
                  Updated_At: now
                });
              }
            );
          }
        );
      });
    });
  }

  async updateFile(id: number, data: UpdateFileRequest): Promise<File | null> {
    return new Promise((resolve, reject) => {
      const updateFields = [];
      const updateValues = [];
      const now = new Date().toISOString();

      if (data.File_Name !== undefined) {
        updateFields.push('File_Name = ?');
        updateValues.push(data.File_Name);
      }
      if (data.File_Path !== undefined) {
        updateFields.push('File_Path = ?');
        updateValues.push(data.File_Path);
      }
      if (data.File_Type !== undefined) {
        updateFields.push('File_Type = ?');
        updateValues.push(data.File_Type);
      }
      if (data.File_Size !== undefined) {
        updateFields.push('File_Size = ?');
        updateValues.push(data.File_Size);
      }

      updateFields.push('Updated_At = ?');
      updateValues.push(now);

      if (updateFields.length === 1) { // 只有 Updated_At
        return this.getFileById(id);
      }

      updateValues.push(id);

      this.getDb().run(
        `UPDATE File SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues,
        function(this: any, err: any) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            resolve(null);
          } else {
            resolve({
              id: id,
              File_Name: data.File_Name || '',
              File_Path: data.File_Path || '',
              File_Type: data.File_Type || '',
              File_Size: data.File_Size || 0,
              Created_At: '',
              Updated_At: now
            });
          }
        }
      );
    });
  }

  async deleteFile(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      
      // 開始事務，先刪除關聯記錄，再刪除文件記錄
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // 刪除上傳關聯記錄
        db.run('DELETE FROM Upload WHERE File_Id = ?', [id], function(this: any, err: any) {
        if (err) {
            db.run('ROLLBACK');
          reject(err);
            return;
          }
          
          // 刪除文件記錄
          db.run('DELETE FROM File WHERE id = ?', [id], function(this: any, fileErr: any) {
            if (fileErr) {
              db.run('ROLLBACK');
              reject(fileErr);
              return;
            }
            
            db.run('COMMIT');
          resolve(this.changes > 0);
          });
        });
      });
    });
  }
} 