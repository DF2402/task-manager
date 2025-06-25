import { DatabaseConnection } from '../database/connection';
import { Schedule, CreateScheduleRequest, UpdateScheduleRequest } from '../models/schedule';

export class ScheduleService {
  private getDb() {
    return DatabaseConnection.getInstance();
  }

  async getAllSchedules(): Promise<Schedule[]> {
        const db = this.getDb();
    return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM Schedule ORDER BY Date DESC',
                (err: any, rows: Schedule[]) => {
                    if (err) reject(err);
                    else resolve(rows || []);
        }
            );
    });
  }

  async getScheduleById(id: number): Promise<Schedule | null> {
        const db = this.getDb();
    return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM Schedule WHERE id = ?',
                [id],
                (err: any, row: Schedule) => {
                    if (err) reject(err);
                    else resolve(row || null);
        }
            );
    });
  }

  async getSchedulesByUserId(userId: number): Promise<Schedule[]> {
        const db = this.getDb();
    return new Promise((resolve, reject) => {
            db.all(
        'SELECT * FROM Schedule WHERE User_Id = ? ORDER BY Date DESC',
        [userId],
                (err: any, rows: Schedule[]) => {
                    if (err) reject(err);
                    else resolve(rows || []);
        }
      );
    });
  }

    async getSchedulesByDate(date: string): Promise<Schedule[]> {
        const db = this.getDb();
    return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM Schedule WHERE Date LIKE ? ORDER BY User_Id',
                [`${date}%`],
                (err: any, rows: Schedule[]) => {
                    if (err) reject(err);
                    else resolve(rows || []);
        }
      );
    });
  }

    async createSchedule(scheduleData: CreateScheduleRequest): Promise<Schedule> {
        const db = this.getDb();
        const result = await new Promise<{ lastID: number }>((resolve, reject) => {
            db.run(
                'INSERT INTO Schedule (User_Id, Date) VALUES (?, ?)',
                [scheduleData.User_Id, scheduleData.Date],
                function(err: any) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID });
                }
            );
        });

        const newSchedule = await this.getScheduleById(result.lastID);
        if (!newSchedule) {
            throw new Error('Failed to create schedule');
        }
        return newSchedule;
    }

    async updateSchedule(id: number, scheduleData: UpdateScheduleRequest): Promise<Schedule | null> {
        const db = this.getDb();
        const result = await new Promise<{ changes: number }>((resolve, reject) => {
            db.run(
                'UPDATE Schedule SET User_Id = COALESCE(?, User_Id), Date = COALESCE(?, Date) WHERE id = ?',
                [scheduleData.User_Id, scheduleData.Date, id],
                function(err: any) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
      }
            );
        });

        if (result.changes === 0) {
            return null;
        }

        return this.getScheduleById(id);
      }

    async deleteSchedule(id: number): Promise<boolean> {
        const db = this.getDb();
        const result = await new Promise<{ changes: number }>((resolve, reject) => {
            db.run(
                'DELETE FROM Schedule WHERE id = ?',
                [id],
                function(err: any) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
        }
      );
    });

        return result.changes > 0;
  }
} 