"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    console.error('API Error:', error);
    // 預設錯誤狀態碼
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    // SQLite 錯誤處理
    if (error.message.includes('SQLITE_CONSTRAINT')) {
        statusCode = 400;
        message = 'Data constraint violation';
    }
    // 數據庫連接錯誤
    if (error.message.includes('SQLITE_BUSY')) {
        statusCode = 503;
        message = 'Database is busy, please try again';
    }
    res.status(statusCode).json({
        success: false,
        message: message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map