import { DatabaseConnection } from '../database/connection';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task';

export class TaskService {
  private getDb() {
    return DatabaseConnection.getInstance();
  }

  async getAllTasks(): Promise<Task[]> {
        const db = this.getDb();
    return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM Task ORDER BY Created_At DESC',
                (err: any, rows: Task[]) => {
                    if (err) reject(err);
                    else resolve(rows || []);
        }
            );
    });
  }

  async getTaskById(id: number): Promise<Task | null> {
        const db = this.getDb();
    return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM Task WHERE id = ?',
                [id],
                (err: any, row: Task) => {
                    if (err) reject(err);
                    else resolve(row || null);
        }
            );
    });
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
        const db = this.getDb();
    return new Promise((resolve, reject) => {
            db.all(
        'SELECT * FROM Task WHERE User_Id = ? ORDER BY Created_At DESC',
        [userId],
                (err: any, rows: Task[]) => {
                    if (err) reject(err);
                    else resolve(rows || []);
        }
      );
    });
  }

    async createTask(taskData: CreateTaskRequest): Promise<Task> {
        const db = this.getDb();
        const result = await new Promise<{ lastID: number }>((resolve, reject) => {
            db.run(
                'INSERT INTO Task (Content, User_Id, Work_in_progress, To_review, Done) VALUES (?, ?, ?, ?, ?)',
                [
                    taskData.Content,
                    taskData.User_Id,
                    taskData.Work_in_progress ? 1 : 0,
                    taskData.To_review ? 1 : 0,
                    taskData.Done ? 1 : 0
                ],
                function(err: any) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID });
        }
      );
    });

        const newTask = await this.getTaskById(result.lastID);
        if (!newTask) {
            throw new Error('Failed to create task');
        }
        return newTask;
  }

    async updateTask(id: number, taskData: UpdateTaskRequest): Promise<Task | null> {
        const db = this.getDb();
        const result = await new Promise<{ changes: number }>((resolve, reject) => {
            db.run(
                `UPDATE Task SET 
                    Content = COALESCE(?, Content),
                    User_Id = COALESCE(?, User_Id),
                    Work_in_progress = COALESCE(?, Work_in_progress),
                    To_review = COALESCE(?, To_review),
                    Done = COALESCE(?, Done),
                    Updated_At = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [
                    taskData.Content,
                    taskData.User_Id,
                    taskData.Work_in_progress !== undefined ? (taskData.Work_in_progress ? 1 : 0) : null,
                    taskData.To_review !== undefined ? (taskData.To_review ? 1 : 0) : null,
                    taskData.Done !== undefined ? (taskData.Done ? 1 : 0) : null,
                    id
                ],
                function(err: any) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
        }
      );
    });

        if (result.changes === 0) {
            return null;
        }

        return this.getTaskById(id);
  }

  async deleteTask(id: number): Promise<boolean> {
        const db = this.getDb();
        const result = await new Promise<{ changes: number }>((resolve, reject) => {
            db.run(
                'DELETE FROM Task WHERE id = ?',
                [id],
                function(err: any) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });

        return result.changes > 0;
    }

    async markTaskInProgress(id: number): Promise<Task | null> {
        return this.updateTask(id, { Work_in_progress: true, To_review: false, Done: false });
        }

    async markTaskForReview(id: number): Promise<Task | null> {
        return this.updateTask(id, { Work_in_progress: false, To_review: true, Done: false });
    }

    async markTaskDone(id: number): Promise<Task | null> {
        return this.updateTask(id, { Work_in_progress: false, To_review: false, Done: true });
  }
} 