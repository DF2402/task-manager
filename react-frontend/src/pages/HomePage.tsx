import { useState, useEffect } from 'react';
import TaskCard from '../components/task-card';
import AddTaskCard from '../components/add-task-card';
import { User } from '../types/user';
import { Task } from '../types/task';
import { AddTaskCardProps } from '../components/add-task-card';
import '../styles/HomePage.css';

// 定義任務數據類型
interface FetchHomePageDataProps {
  users: User[];
  tasks: Task[];
}

// 定義篩選狀態類型
type FilterStatus = 'all' | 'in-progress' | 'to-review' | 'done' | 'to-do';

// 定義排序類型
type SortBy = 'created-desc' | 'created-asc' | 'updated-desc' | 'updated-asc' | 'status' ;

function HomePage() {
    const [loading, setLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // 篩選狀態
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterUser, setFilterUser] = useState<number>(0); // 0 表示所有用戶
  const [searchTerm, setSearchTerm] = useState('');
  
  // 排序狀態
  const [sortBy, setSortBy] = useState<SortBy>('created-desc');

    const fetchHomePageData = async () => {
            setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/users');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setUsers(result.data);
      } else {
        console.error('Invalid users data format:', result);
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    }
    try {
      const response = await fetch('http://localhost:3001/api/tasks');
            const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setTasks(result.data);
      } else {
        console.error('Invalid tasks data format:', result);
        setTasks([]);
      }
        } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    }
            setLoading(false);
    }

    useEffect(() => {
        fetchHomePageData();  
    }, []);

  // 篩選邏輯
  const filteredTasks = tasks.filter(task => {
    // 按狀態篩選
    let statusMatch = true;
    switch (filterStatus) {
      case 'in-progress':
        statusMatch = task.Work_in_progress;
        break;
      case 'to-review':
        statusMatch = task.To_review;
        break;
      case 'done':
        statusMatch = task.Done;
        break;
      case 'to-do':
        statusMatch = !task.Work_in_progress && !task.To_review && !task.Done;
        break;
      default:
        statusMatch = true;
    }

    // 按用戶篩選
    const userMatch = filterUser === 0 || task.User_Id === filterUser;

    // 按搜索詞篩選
    const searchMatch = searchTerm === '' || 
      task.Content.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && userMatch && searchMatch;
  });

  // 排序邏輯
  const sortedAndFilteredTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'created-desc':
        return new Date(b.Created_At).getTime() - new Date(a.Created_At).getTime();
      case 'created-asc':
        return new Date(a.Created_At).getTime() - new Date(b.Created_At).getTime();
      case 'updated-desc':
        return new Date(b.Updated_At).getTime() - new Date(a.Updated_At).getTime();
      case 'updated-asc':
        return new Date(a.Updated_At).getTime() - new Date(b.Updated_At).getTime();
      case 'status':
        // 排序優先級：Done > To Review > In Progress > Not Started
        const getStatusPriority = (task: Task) => {
          if (task.Done) return 4;
          if (task.To_review) return 3;
          if (task.Work_in_progress) return 2;
          return 1; // not started
        };
        return getStatusPriority(b) - getStatusPriority(a);
      default:
        return 0;
    }
  });

  // 獲取用戶名稱
  const getUserName = (userId: number): string => {
    const user = users.find(u => u.id === userId);
    return user ? user.Name : 'Unknown User';
  };

  // 清除所有篩選和排序
  const clearFilters = () => {
    setFilterStatus('all');
    setFilterUser(0);
    setSearchTerm('');
    setSortBy('created-desc');
  };

  const toggleView = () => {
    setIsGridView(!isGridView);
  };



  const onAddTask = async (taskContent: string, user_Id: number) => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Content: taskContent,
          User_Id: user_Id,
          Work_in_progress: false,
          To_review: false,
          Done: false,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        setTasks([...tasks, result.data]);
        fetchHomePageData();
      } else {
        throw new Error(result.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };



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

      {/* 篩選和排序區域 */}
      <section className="filter-section">
        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="search">Search Task:</label>
            <input
              id="search"
              type="text"
              placeholder="Search Task Content"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Status Filter:</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="to-do">To-Do</option>
              <option value="in-progress">In Progress</option>
              <option value="to-review">To Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="user-filter">User Filter:</label>
            <select
              id="user-filter"
              value={filterUser}
              onChange={(e) => setFilterUser(Number(e.target.value))}
              className="filter-select"
            >
              <option value={0}>All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.Name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-select">Sort By:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="filter-select"
            >
              <option value="created-desc">Created Date (Newest)</option>
              <option value="created-asc">Created Date (Oldest)</option>
              <option value="updated-desc">Updated Date (Newest)</option>
              <option value="updated-asc">Updated Date (Oldest)</option>
              <option value="status">Status Priority</option>
            </select>
          </div>

          <div className="filter-group">
            <button 
              onClick={clearFilters}
              className="clear-filters-btn"
              title="Clear All Filters"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* 篩選和排序結果統計 */}
        <div className="filter-stats">
          <span>
            Showing {sortedAndFilteredTasks.length} / {tasks.length} tasks
            {(filterStatus !== 'all' || filterUser !== 0 || searchTerm !== '' || sortBy !== 'created-desc') && (
              <span className="filter-active"> (Filtered/Sorted)</span>
            )}
          </span>
          <span className="sort-info">
            {' • '}Sorted by: {
              sortBy === 'created-desc' ? 'Created Date (Newest)' :
              sortBy === 'created-asc' ? 'Created Date (Oldest)' :
              sortBy === 'updated-desc' ? 'Updated Date (Newest)' :
              sortBy === 'updated-asc' ? 'Updated Date (Oldest)' :
              sortBy === 'status' ? 'Status Priority' : 'Default'
            }
          </span>
        </div>
      </section>

      <section className="task-section">
        {loading && (
          <div className="loading-message">
            <p>Loading tasks...</p>
          </div>
        )}
        
        {sortedAndFilteredTasks && sortedAndFilteredTasks.length > 0 && (
          <div className={isGridView ? "tasks-grid" : "tasks-list"}>
            {sortedAndFilteredTasks.map((task: Task) => (
              <div key={task.id} className="task-wrapper">
                <TaskCard 
                  task={task} 
                  users={users} 
                  onClick={() => window.location.href = `/task/${task.id}`}
                />
              </div>
          ))}
          </div>
        )}

        {sortedAndFilteredTasks && sortedAndFilteredTasks.length === 0 && !loading && (
          <div className="no-tasks-message">
            {tasks.length === 0 ? (
              <>
                <p>No tasks</p>
                <p>Please ensure the backend API server is running</p>
              </>
            ) : (
              <>
                <p>No tasks matching the filters</p>
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear Filters
                </button>
              </>
            )}
            </div>
          )}
        </section>

      <AddTaskCard onTaskAdded={onAddTask} users={users} />
      </div>
    );
  }

export default HomePage;