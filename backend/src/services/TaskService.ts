import { DatabaseConnection } from '../database/connection';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task';

export class TaskService {
  private getDb() {
    return DatabaseConnection.getInstance();
  }

  async getAllTasks(): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      this.getDb().all('SELECT * FROM Task ORDER BY Created_At DESC', (err: any, rows: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Task[]);
        }
      });
    });
  }

  async getTaskById(id: number): Promise<Task | null> {
    return new Promise((resolve, reject) => {
      this.getDb().get('SELECT * FROM Task WHERE id = ?', [id], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as Task || null);
        }
      });
    });
  }

  async getTasksByWorkerId(workerId: number): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      this.getDb().all(
        'SELECT * FROM Task WHERE Worker_Id = ? ORDER BY Created_At DESC',
        [workerId],
        (err: any, rows: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Task[]);
          }
        }
      );
    });
  }

  async createTask(data: CreateTaskRequest): Promise<Task> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      this.getDb().run(
        'INSERT INTO Task (Content, Worker_Id, Work_in_progress, To_review, Done, Created_At, Updated_At) VALUES (?, ?, 0, 0, 0, ?, ?)',
        [data.Content, data.Worker_Id, now, now],
        function(this: any, err: any) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              Content: data.Content,
              Worker_Id: data.Worker_Id,
              Work_in_progress: false,
              To_review: false,
              Done: false,
              Created_At: now,
              Updated_At: now
            });
          }
        }
      );
    });
  }

  async updateTask(id: number, data: UpdateTaskRequest): Promise<Task | null> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      
      // 構建動態更新查詢
      const updates: string[] = [];
      const values: any[] = [];
      
      if (data.Content !== undefined) {
        updates.push('Content = ?');
        values.push(data.Content);
      }
      if (data.Worker_Id !== undefined) {
        updates.push('Worker_Id = ?');
        values.push(data.Worker_Id);
      }
      if (data.Work_in_progress !== undefined) {
        updates.push('Work_in_progress = ?');
        values.push(data.Work_in_progress ? 1 : 0);
      }
      if (data.To_review !== undefined) {
        updates.push('To_review = ?');
        values.push(data.To_review ? 1 : 0);
      }
      if (data.Done !== undefined) {
        updates.push('Done = ?');
        values.push(data.Done ? 1 : 0);
      }
      
      updates.push('Updated_At = ?');
      values.push(now);
      values.push(id);

      this.getDb().run(
        `UPDATE Task SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function(this: any, err: any) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            resolve(null);
          } else {
            // 獲取更新後的記錄
            resolve({
              id: id,
              Content: data.Content || '',
              Worker_Id: data.Worker_Id || 0,
              Work_in_progress: data.Work_in_progress || false,
              To_review: data.To_review || false,
              Done: data.Done || false,
              Created_At: '',
              Updated_At: now
            });
          }
        }
      );
    });
  }

  async deleteTask(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getDb().run('DELETE FROM Task WHERE id = ?', [id], function(this: any, err: any) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
} 