import { useState, useEffect } from "react";
import TaskCard from "../components/task-card";
import AddTaskCard from "../components/add-task-card";
import { User } from "../types/user";
import { Task } from "../types/task";
import { AddTaskCardProps } from "../components/add-task-card";
import "../styles/index.css";
import { useNavigate } from "react-router-dom";

// 定義任務數據類型
interface FetchHomePageDataProps {
  users: User[];
  tasks: Task[];
}

// 定義篩選狀態類型
type FilterStatus = "all" | "in-progress" | "to-review" | "done" | "to-do";

// 定義排序類型
type SortBy =
  | "created-desc"
  | "created-asc"
  | "updated-desc"
  | "updated-asc"
  | "status";

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string>("");

  // 篩選狀態
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterUser, setFilterUser] = useState<number>(0); // 0 表示所有用戶
  const [searchTerm, setSearchTerm] = useState("");

  // 排序狀態
  const [sortBy, setSortBy] = useState<SortBy>("created-desc");

  const navigate = useNavigate();

  const fetchHomePageData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:3001/api/users");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setUsers(result.data);
      } else {
        throw new Error("Invalid users data format");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("Failed to load users data. Please try again later.");
      setUsers([]);
    }
    try {
      const response = await fetch("http://localhost:3001/api/tasks");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setTasks(result.data);
      } else {
        throw new Error("Invalid tasks data format");
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setError((prev) =>
        prev
          ? `${prev}\nFailed to load tasks data.`
          : "Failed to load tasks data. Please try again later."
      );
      setTasks([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHomePageData();
  }, []);

  // 篩選邏輯
  const filteredTasks = tasks.filter((task) => {
    // 按狀態篩選
    let statusMatch = true;
    switch (filterStatus) {
      case "in-progress":
        statusMatch = task.Work_in_progress;
        break;
      case "to-review":
        statusMatch = task.To_review;
        break;
      case "done":
        statusMatch = task.Done;
        break;
      case "to-do":
        statusMatch = !task.Work_in_progress && !task.To_review && !task.Done;
        break;
      default:
        statusMatch = true;
    }

    // 按用戶篩選
    const userMatch = filterUser === 0 || task.User_Id === filterUser;

    // 按搜索詞篩選
    const searchMatch =
      searchTerm === "" ||
      task.Content.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && userMatch && searchMatch;
  });

  // 排序邏輯
  const sortedAndFilteredTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "created-desc":
        return (
          new Date(b.Created_At).getTime() - new Date(a.Created_At).getTime()
        );
      case "created-asc":
        return (
          new Date(a.Created_At).getTime() - new Date(b.Created_At).getTime()
        );
      case "updated-desc":
        return (
          new Date(b.Updated_At).getTime() - new Date(a.Updated_At).getTime()
        );
      case "updated-asc":
        return (
          new Date(a.Updated_At).getTime() - new Date(b.Updated_At).getTime()
        );
      case "status":
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
    const user = users.find((u) => u.id === userId);
    return user ? user.Name : "Unknown User";
  };

  // 清除所有篩選和排序
  const clearFilters = () => {
    setFilterStatus("all");
    setFilterUser(0);
    setSearchTerm("");
    setSortBy("created-desc");
  };

  const toggleView = () => {
    setIsGridView(!isGridView);
  };

  const onAddTask = async (taskContent: string, user_Id: number) => {
    try {
      const response = await fetch("http://localhost:3001/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        throw new Error(result.message || "Failed to create task");
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-0 m-0">
      {/* Header */}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-center text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mx-8"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline whitespace-pre-line">{error}</span>
        </div>
      )}
      <div className="flex justify-between items-center mb-6 mt-6">
        <h1 className="text-2xl font-bold text-gray-800">Task Management</h1>
        <button
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          onClick={() => setIsGridView(!isGridView)}
        >
          {isGridView ? "List View" : "Grid View"}
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-8">
        {/* Filter Card */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="card-title text-xl">Filter & Sort</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="card-select w-full"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as FilterStatus)
                }
              >
                <option value="all">All Status</option>
                <option value="to-do">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="to-review">To Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* User Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                className="card-select w-full"
                value={filterUser}
                onChange={(e) => setFilterUser(Number(e.target.value))}
              >
                <option value={0}>All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                className="card-select w-full"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
              >
                <option value="created-desc">Newest First</option>
                <option value="created-asc">Oldest First</option>
                <option value="updated-desc">Recently Updated</option>
                <option value="updated-asc">Least Recently Updated</option>
                <option value="status">By Status</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                className="card-input w-full"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tasks Grid/List */}
        <div className={isGridView ? "tasks-grid" : "tasks-list"}>
          {loading ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : sortedAndFilteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tasks found</div>
          ) : (
            sortedAndFilteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                onClick={() => navigate(`/task/${task.id}`)}
                onStatusClick={(status) => setFilterStatus(status)}
                onUserClick={(userId) => setFilterUser(userId)}
              />
            ))
          )}
        </div>
      </div>

      {/* Add Task Card */}
      <AddTaskCard onTaskAdded={onAddTask} users={users} />
    </div>
  );
}

export default HomePage;
