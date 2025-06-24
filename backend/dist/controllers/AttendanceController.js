"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const connection_1 = require("../database/connection");
class AttendanceController {
    constructor() {
        this.db = connection_1.DatabaseConnection.getInstance();
    }
    // 獲取所有考勤記錄
    async getAll(req, res, next) {
        try {
            const attendance = await new Promise((resolve, reject) => {
                this.db.all('SELECT * FROM Attendance ORDER BY Date DESC', (err, rows) => {
                    if (err)
                        reject(err);
                    else
                        resolve(rows);
                });
            });
            res.json({
                success: true,
                data: attendance.map(record => ({
                    date: record.Date,
                    worker_id: record.Worker_Id
                })),
                count: attendance.length
            });
        }
        catch (error) {
            next(error);
        }
    }
    // 根據工作者ID獲取考勤記錄
    async getByWorkerId(req, res, next) {
        try {
            const { workerId } = req.params;
            const attendance = await new Promise((resolve, reject) => {
                this.db.all('SELECT * FROM Attendance WHERE Worker_Id = ? ORDER BY Date DESC', [workerId], (err, rows) => {
                    if (err)
                        reject(err);
                    else
                        resolve(rows);
                });
            });
            res.json({
                success: true,
                data: attendance.map(record => ({
                    date: record.Date,
                    worker_id: record.Worker_Id
                })),
                count: attendance.length
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AttendanceController = AttendanceController;
//# sourceMappingURL=AttendanceController.js.map