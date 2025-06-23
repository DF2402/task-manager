import { DatabaseConnection } from '../database/connection';
import { Worker, CreateWorkerRequest, UpdateWorkerRequest } from '../models/worker';

export class WorkerService {
  private getDb() {
    return DatabaseConnection.getInstance();
  }

  async getAllWorkers(): Promise<Worker[]> {
    return new Promise((resolve, reject) => {
      this.getDb().all('SELECT * FROM Worker ORDER BY id DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Worker[]);
        }
      });
    });
  }

  async getWorkerById(id: number): Promise<Worker | null> {
    return new Promise((resolve, reject) => {
      this.getDb().get('SELECT * FROM Worker WHERE id = ?', [id], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as Worker || null);
        }
      });
    });
  }

  async createWorker(data: CreateWorkerRequest): Promise<Worker> {
    return new Promise((resolve, reject) => {
      this.getDb().run(
        'INSERT INTO Worker (Name) VALUES (?)',
        [data.Name],
        function(this: any, err: any) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              Name: data.Name
            });
          }
        }
      );
    });
  }

  async updateWorker(id: number, data: UpdateWorkerRequest): Promise<Worker | null> {
    return new Promise((resolve, reject) => {
      this.getDb().run(
        'UPDATE Worker SET Name = ? WHERE id = ?',
        [data.Name, id],
        function(this: any, err: any) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            resolve(null);
          } else {
            resolve({
              id: id,
              Name: data.Name!
            });
          }
        }
      );
    });
  }

  async deleteWorker(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getDb().run('DELETE FROM Worker WHERE id = ?', [id], function(this: any, err: any) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
} 