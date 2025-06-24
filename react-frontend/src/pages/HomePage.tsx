import { useState, useEffect } from 'react';
import '../styles/HomePage.css';
import Task from '../components/task';
import AddTaskCard from '../components/add-task-card';
// 定義任務數據類型
interface TaskData {
  id: number;
  Content: string;
  Worker_Id: number;
  Work_in_progress: boolean;
  To_review: boolean;
  Done: boolean;
  Created_At: string;
  Updated_At: string;
}

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TaskData[] | null>(null);
  const [isGridView, setIsGridView] = useState(true);

  const fetchHomePageData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/home-page');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHomePageData();
  }, []);

  const toggleView = () => {
    setIsGridView(!isGridView);
  };

  const handleTaskAdded = () => {
    fetchHomePageData(); // 重新獲取數據
  };

  const renderTaskStatus = (task: TaskData) => (
    <div className="task-status">
      {task.Work_in_progress && <span className="status-badge in-progress">In Progress</span>}
      {task.To_review && <span className="status-badge to-review">To Review</span>}
      {task.Done && <span className="status-badge done">Done</span>}
    </div>
  );

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1 className="home-title">Task Management System</h1>
          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${isGridView ? 'active' : ''}`}
              onClick={toggleView}
              title="grid view"
            >
              📱
            </button>
            <button 
              className={`view-toggle-btn ${!isGridView ? 'active' : ''}`}
              onClick={toggleView}
              title="list view"
            >
              📝
            </button>
          </div>
        </div>
      </header>

      <section className="task-section">
        {loading && (
          <div className="loading-message">
            <p>正在載入任務...</p>
          </div>
        )}
        
        {data && data.length > 0 && (
          <div className={isGridView ? "tasks-grid" : "tasks-list"}>
            {data.map((task: TaskData) => (
              <Task key={task.id} task={task} />
            ))}
          </div>
        )}

        {data && data.length === 0 && !loading && (
          <div className="no-tasks-message">
            <p>No tasks</p>
            <p>Please ensure the backend API server is running</p>
          </div>
        )}
      </section>

      <AddTaskCard onTaskAdded={handleTaskAdded} />
    </div>
  );
}

export default HomePage;