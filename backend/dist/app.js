"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = require("./database/connection");
const workerRoutes_1 = __importDefault(require("./routes/workerRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const attendanceRoutes_1 = __importDefault(require("./routes/attendanceRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// 核心中間件配置
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // React 前端地址
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// 請求日誌中間件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// API 路由配置
app.use('/api/workers', workerRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
app.use('/api/attendance', attendanceRoutes_1.default);
// 健康檢查端點
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// 首頁任務端點 (為前端 HomePage 提供數據)
app.get('/api/home-page', async (req, res, next) => {
    try {
        const { TaskService } = await Promise.resolve().then(() => __importStar(require('./services/TaskService')));
        const taskService = new TaskService();
        const tasks = await taskService.getAllTasks();
        res.json(tasks);
    }
    catch (error) {
        next(error);
    }
});
// 錯誤處理中間件
app.use(errorHandler_1.errorHandler);
// 404 處理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});
// 服務器啟動邏輯
async function startServer() {
    try {
        // 初始化數據庫連接
        const config = (0, connection_1.getDatabaseConfig)(process.env.NODE_ENV);
        await connection_1.DatabaseConnection.initialize(config);
        app.listen(PORT, () => {
            console.log('🚀 API Server Started!');
            console.log(`📡 Server running on http://localhost:${PORT}`);
            console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
            console.log('📄 Available routes:');
            console.log('  - GET    /api/health');
            console.log('  - GET    /api/home-page');
            console.log('  - GET    /api/workers');
            console.log('  - POST   /api/workers');
            console.log('  - GET    /api/workers/:id');
            console.log('  - PUT    /api/workers/:id');
            console.log('  - DELETE /api/workers/:id');
            console.log('  - GET    /api/tasks');
            console.log('  - POST   /api/tasks');
            console.log('  - GET    /api/tasks/:id');
            console.log('  - GET    /api/tasks/worker/:workerId');
            console.log('  - PUT    /api/tasks/:id');
            console.log('  - DELETE /api/tasks/:id');
            console.log('  - GET    /api/attendance');
            console.log('  - POST   /api/attendance');
            console.log('  - GET    /api/attendance/:id');
            console.log('  - GET    /api/attendance/worker/:workerId');
            console.log('  - PUT    /api/attendance/:id');
            console.log('  - DELETE /api/attendance/:id');
        });
    }
    catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
}
// 優雅關閉處理
process.on('SIGINT', async () => {
    console.log('\n📡 Shutting down server gracefully...');
    try {
        connection_1.DatabaseConnection.close();
        console.log('✅ Server closed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});
startServer();
exports.default = app;
//# sourceMappingURL=app.js.map