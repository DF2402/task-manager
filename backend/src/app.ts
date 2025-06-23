import express from 'express';
import cors from 'cors';
import { DatabaseConnection, getDatabaseConfig } from './database/connection';
import workerRoutes from './routes/workerRoutes';
import taskRoutes from './routes/taskRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// 核心中間件配置
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // React 前端地址
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 請求日誌中間件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API 路由配置
app.use('/api/workers', workerRoutes);
app.use('/api/tasks', taskRoutes);

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
    const { TaskService } = await import('./services/TaskService');
    const taskService = new TaskService();
    const tasks = await taskService.getAllTasks();
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// 錯誤處理中間件
app.use(errorHandler);

// 服務器啟動邏輯
async function startServer() {
  try {
    // 初始化數據庫連接
    const config = getDatabaseConfig(process.env.NODE_ENV);
    await DatabaseConnection.initialize(config);
    
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
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

// 優雅關閉處理
process.on('SIGINT', async () => {
  console.log('\n📡 Shutting down server gracefully...');
  try {
    DatabaseConnection.close();
    console.log('✅ Server closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();

export default app;
