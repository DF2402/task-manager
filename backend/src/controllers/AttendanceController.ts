import { Request, Response, NextFunction } from "express";
import { DatabaseConnection } from "../database/connection";

export class AttendanceController {
  // 獲取所有考勤記錄
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const db = DatabaseConnection.getInstance();

      // 檢查數據庫連接
      if (!db) {
        throw new Error("Database connection not available");
      }

      const attendance = await new Promise<any[]>((resolve, reject) => {
        db.all(
          `SELECT 
                        id,
                        Worker_Id as User_Id,
                        datetime(Date) as Date,
                        datetime(Date) as Created_At
                    FROM Attendance 
                    ORDER BY Date DESC`,
          [], // 添加空參數數組
          (err, rows) => {
            if (err) {
              console.error("Database query error:", err);
              reject(err);
            } else {
              if (!Array.isArray(rows)) {
                reject(new Error("Invalid data format from database"));
                return;
              }
              resolve(rows);
            }
          }
        );
      });

      // 檢查返回的數據格式
      if (!Array.isArray(attendance)) {
        throw new Error("Invalid attendance data format");
      }

      res.json({
        success: true,
        data: attendance,
        count: attendance.length,
      });
    } catch (error) {
      console.error("Error in getAll:", error);
      // 創建自定義錯誤對象
      const apiError = new Error(
        error instanceof Error ? error.message : "Unknown error"
      );
      (apiError as any).statusCode = 500;
      next(apiError);
    }
  }

  // 根據工作者ID獲取考勤記錄
  async getByWorkerId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const db = DatabaseConnection.getInstance();

      // 檢查數據庫連接
      if (!db) {
        throw new Error("Database connection not available");
      }

      const { workerId } = req.params;

      // 驗證 workerId
      if (!workerId || isNaN(Number(workerId))) {
        throw new Error("Invalid worker ID");
      }

      const attendance = await new Promise<any[]>((resolve, reject) => {
        db.all(
          `SELECT 
                        id,
                        Worker_Id as User_Id,
                        datetime(Date) as Date,
                        datetime(Date) as Created_At
                    FROM Attendance 
                    WHERE Worker_Id = ? 
                    ORDER BY Date DESC`,
          [workerId],
          (err, rows) => {
            if (err) {
              console.error("Database query error:", err);
              reject(err);
            } else {
              if (!Array.isArray(rows)) {
                reject(new Error("Invalid data format from database"));
                return;
              }
              resolve(rows);
            }
          }
        );
      });

      // 檢查返回的數據格式
      if (!Array.isArray(attendance)) {
        throw new Error("Invalid attendance data format");
      }

      res.json({
        success: true,
        data: attendance,
        count: attendance.length,
      });
    } catch (error) {
      console.error("Error in getByWorkerId:", error);
      // 創建自定義錯誤對象
      const apiError = new Error(
        error instanceof Error ? error.message : "Unknown error"
      );
      (apiError as any).statusCode = 500;
      next(apiError);
    }
  }
}
