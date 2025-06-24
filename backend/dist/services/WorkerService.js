"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerService = void 0;
const connection_1 = require("../database/connection");
class WorkerService {
    getDb() {
        return connection_1.DatabaseConnection.getInstance();
    }
    async getAllWorkers() {
        return new Promise((resolve, reject) => {
            this.getDb().all('SELECT * FROM Worker ORDER BY id DESC', (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    async getWorkerById(id) {
        return new Promise((resolve, reject) => {
            this.getDb().get('SELECT * FROM Worker WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row || null);
                }
            });
        });
    }
    async createWorker(data) {
        return new Promise((resolve, reject) => {
            this.getDb().run('INSERT INTO Worker (Name) VALUES (?)', [data.Name], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        id: this.lastID,
                        Name: data.Name
                    });
                }
            });
        });
    }
    async updateWorker(id, data) {
        return new Promise((resolve, reject) => {
            this.getDb().run('UPDATE Worker SET Name = ? WHERE id = ?', [data.Name, id], function (err) {
                if (err) {
                    reject(err);
                }
                else if (this.changes === 0) {
                    resolve(null);
                }
                else {
                    resolve({
                        id: id,
                        Name: data.Name
                    });
                }
            });
        });
    }
    async deleteWorker(id) {
        return new Promise((resolve, reject) => {
            this.getDb().run('DELETE FROM Worker WHERE id = ?', [id], function (err) {
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
exports.WorkerService = WorkerService;
//# sourceMappingURL=WorkerService.js.map