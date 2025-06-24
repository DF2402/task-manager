"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const connection_1 = require("../database/connection");
class TaskService {
    getDb() {
        return connection_1.DatabaseConnection.getInstance();
    }
    async getAllTasks() {
        return new Promise((resolve, reject) => {
            this.getDb().all('SELECT * FROM Task ORDER BY Created_At DESC', (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    async getTaskById(id) {
        return new Promise((resolve, reject) => {
            this.getDb().get('SELECT * FROM Task WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row || null);
                }
            });
        });
    }
    async getTasksByWorkerId(workerId) {
        return new Promise((resolve, reject) => {
            this.getDb().all('SELECT * FROM Task WHERE Worker_Id = ? ORDER BY Created_At DESC', [workerId], (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    async createTask(data) {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            this.getDb().run('INSERT INTO Task (Content, Worker_Id, Work_in_progress, To_review, Done, Created_At, Updated_At) VALUES (?, ?, 0, 0, 0, ?, ?)', [data.Content, data.Worker_Id, now, now], function (err) {
                if (err) {
                    reject(err);
                }
                else {
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
            });
        });
    }
    async updateTask(id, data) {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            // 構建動態更新查詢
            const updates = [];
            const values = [];
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
            this.getDb().run(`UPDATE Task SET ${updates.join(', ')} WHERE id = ?`, values, function (err) {
                if (err) {
                    reject(err);
                }
                else if (this.changes === 0) {
                    resolve(null);
                }
                else {
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
            });
        });
    }
    async deleteTask(id) {
        return new Promise((resolve, reject) => {
            this.getDb().run('DELETE FROM Task WHERE id = ?', [id], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.changes > 0);
                }
            });
        });
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=TaskService.js.map