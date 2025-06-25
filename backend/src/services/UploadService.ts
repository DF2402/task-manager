import { DatabaseConnection } from '../database/connection';
import { Upload, CreateUploadRequest, UpdateUploadRequest } from '../models/upload';

export class UploadService {
  private getDb() {
    return DatabaseConnection.getInstance();
  }

  async getAllUploads(): Promise<Upload[]> {
    return new Promise((resolve, reject) => {
      this.getDb().all('SELECT * FROM Upload ORDER BY Created_At DESC', (err: any, rows: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Upload[]);
        }
      });
    });
  }

  async getUploadById(id: number): Promise<Upload | null> {
    return new Promise((resolve, reject) => {
      this.getDb().get('SELECT * FROM Upload WHERE id = ?', [id], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as Upload || null);
        }
      });
    });
  }

  async getUploadsByTaskId(taskId: number): Promise<Upload[]> {
    return new Promise((resolve, reject) => {
      this.getDb().all(
        'SELECT * FROM Upload WHERE Task_Id = ? ORDER BY Created_At DESC',
        [taskId],
        (err: any, rows: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Upload[]);
          }
        }
      );
    });
  }

  async getUploadsByFileId(fileId: number): Promise<Upload[]> {
    return new Promise((resolve, reject) => {
      this.getDb().all(
        'SELECT * FROM Upload WHERE File_Id = ? ORDER BY Created_At DESC',
        [fileId],
        (err: any, rows: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Upload[]);
          }
        }
      );
    });
  }

  async createUpload(data: CreateUploadRequest): Promise<Upload> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      this.getDb().run(
        'INSERT INTO Upload (File_Id, Task_Id, Created_At) VALUES (?, ?, ?)',
        [data.File_Id || null, data.Task_Id || null, now],
        function(this: any, err: any) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              File_Id: data.File_Id || null,
              Task_Id: data.Task_Id || null,
              Created_At: now
            });
          }
        }
      );
    });
  }

  async updateUpload(id: number, data: UpdateUploadRequest): Promise<Upload | null> {
    return new Promise((resolve, reject) => {
      const updateFields = [];
      const updateValues = [];

      if (data.File_Id !== undefined) {
        updateFields.push('File_Id = ?');
        updateValues.push(data.File_Id);
      }
      if (data.Task_Id !== undefined) {
        updateFields.push('Task_Id = ?');
        updateValues.push(data.Task_Id);
      }

      if (updateFields.length === 0) {
        return this.getUploadById(id);
      }

      updateValues.push(id);

      this.getDb().run(
        `UPDATE Upload SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues,
        function(this: any, err: any) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            resolve(null);
          } else {
            resolve({
              id: id,
              File_Id: data.File_Id || null,
              Task_Id: data.Task_Id || null,
              Created_At: ''
            });
          }
        }
      );
    });
  }

  async deleteUpload(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getDb().run('DELETE FROM Upload WHERE id = ?', [id], function(this: any, err: any) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
} 