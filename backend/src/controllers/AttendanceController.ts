import { Request, Response, NextFunction } from 'express';
import { DatabaseConnection } from '../database/connection';

export class AttendanceController {
    // 獲取所有考勤記錄
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const db = DatabaseConnection.getInstance();
            const attendance = await new Promise<any[]>((resolve, reject) => {
                db.all(
                    'SELECT * FROM Attendance ORDER BY Date DESC',
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });

            res.json({
                success: true,
                data: attendance.map(record => ({
                    date: record.Date,
                    worker_id: record.Worker_Id
                })),
                count: attendance.length
            });
        } catch (error) {
            next(error);
        }
    }

    // 根據工作者ID獲取考勤記錄
    async getByWorkerId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const db = DatabaseConnection.getInstance();
            const { workerId } = req.params;
            const attendance = await new Promise<any[]>((resolve, reject) => {
                db.all(
                    'SELECT * FROM Attendance WHERE Worker_Id = ? ORDER BY Date DESC',
                    [workerId],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });

            res.json({
                success: true,
                data: attendance.map(record => ({
                    date: record.Date,
                    worker_id: record.Worker_Id
                })),
                count: attendance.length
            });
        } catch (error) {
            next(error);
        }
    }
} 