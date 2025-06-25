import { DatabaseConnection } from '../database/connection';
import { Schedule, CreateScheduleRequest, UpdateScheduleRequest } from '../models/schedule';

export class ScheduleService {
  private getDb() {
    return DatabaseConnection.getInstance();
  }

  async getAllSchedules(): Promise<Schedule[]> {
    return new Promise((resolve, reject) => {
      this.getDb().all('SELECT * FROM Schedule ORDER BY Date DESC', (err: any, rows: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Schedule[]);
        }
      });
    });
  }

  async getScheduleById(id: number): Promise<Schedule | null> {
    return new Promise((resolve, reject) => {
      this.getDb().get('SELECT * FROM Schedule WHERE id = ?', [id], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as Schedule || null);
        }
      });
    });
  }

  async getSchedulesByUserId(userId: number): Promise<Schedule[]> {
    return new Promise((resolve, reject) => {
      this.getDb().all(
        'SELECT * FROM Schedule WHERE User_Id = ? ORDER BY Date DESC',
        [userId],
        (err: any, rows: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Schedule[]);
          }
        }
      );
    });
  }

  async createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      this.getDb().run(
        'INSERT INTO Schedule (User_Id, Date, Created_At) VALUES (?, ?, ?)',
        [data.User_Id || null, data.Date || null, now],
        function(this: any, err: any) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              User_Id: data.User_Id || null,
              Date: data.Date || null,
              Created_At: now
            });
          }
        }
      );
    });
  }

  async updateSchedule(id: number, data: UpdateScheduleRequest): Promise<Schedule | null> {
    return new Promise((resolve, reject) => {
      const updateFields = [];
      const updateValues = [];

      if (data.User_Id !== undefined) {
        updateFields.push('User_Id = ?');
        updateValues.push(data.User_Id);
      }
      if (data.Date !== undefined) {
        updateFields.push('Date = ?');
        updateValues.push(data.Date);
      }

      if (updateFields.length === 0) {
        return this.getScheduleById(id);
      }

      updateValues.push(id);

      this.getDb().run(
        `UPDATE Schedule SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues,
        function(this: any, err: any) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            resolve(null);
          } else {
            resolve({
              id: id,
              User_Id: data.User_Id || null,
              Date: data.Date || null,
              Created_At: ''
            });
          }
        }
      );
    });
  }

  async deleteSchedule(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getDb().run('DELETE FROM Schedule WHERE id = ?', [id], function(this: any, err: any) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
} 