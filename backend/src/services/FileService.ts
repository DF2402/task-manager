import { DatabaseConnection } from '../database/connection';
import { File, CreateFileRequest, UpdateFileRequest } from '../models/file';

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
      this.getDb().run('DELETE FROM File WHERE id = ?', [id], function(this: any, err: any) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
} 