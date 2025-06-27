import { useState } from "react";
import { User } from "../types/user";

export interface AddTaskCardProps {
  onTaskAdded: (taskContent: string, userId: number) => Promise<void>;
  users: User[];
}

function AddTaskCard({ onTaskAdded, users }: AddTaskCardProps) {
  const [loading, setLoading] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [selectedUser, setSelectedUser] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddTask = async () => {
    if (!taskName.trim() || selectedUser === 0) {
      alert("Please enter task content and select a user");
      return;
    }

    try {
      setLoading(true);
      await onTaskAdded(taskName, selectedUser);
      setTaskName("");
      setSelectedUser(0);
      setIsExpanded(false);
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-xl animate-pulse">
          <span className="text-sm font-medium">Adding task...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:-translate-y-1 hover:shadow-lg"
          title="Add New Task"
        >
          <span className="text-2xl">+</span>
        </button>
      )}

      {/* Expanded Card */}
      {isExpanded && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
            onClick={() => setIsExpanded(false)}
          />

          {/* Card Container */}
          <div className="fixed z-50 bottom-6 right-6 left-6 md:left-auto md:max-w-sm">
            <div className="card shadow-xl m-0">
              <div className="card-header">
                <div className="card-title text-lg">Add New Task</div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="bg-gray-200 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300 transition-all text-lg font-bold"
                  title="Close"
                >
                  ×
                </button>
              </div>

              <div className="card-content">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Task Content:
                    </label>
                    <input
                      type="text"
                      placeholder="Enter task description..."
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      className="card-input w-full"
                      onKeyPress={(e) =>
                        e.key === "Enter" && selectedUser && handleAddTask()
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Assign to:
                    </label>
                    <select
                      className="card-select w-full"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(Number(e.target.value))}
                    >
                      <option value={0}>Select User</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.Name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      className="card-button flex-1"
                      onClick={handleAddTask}
                      disabled={!taskName.trim() || selectedUser === 0}
                    >
                      <span className="mr-2">+</span>
                      Add Task
                    </button>
                    <button
                      className="bg-gray-300 text-gray-700 border-0 px-4 py-2 rounded-xl font-semibold cursor-pointer transition-all hover:bg-gray-400"
                      onClick={() => setIsExpanded(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default AddTaskCard;
