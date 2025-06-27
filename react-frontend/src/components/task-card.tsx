import { Task } from "../types/task";
import { User } from "../types/user";

interface TaskProps {
  task: Task;
  users: User[];
  onClick?: () => void;
  onStatusClick?: (
    status: "to-do" | "in-progress" | "to-review" | "done"
  ) => void;
  onUserClick?: (userId: number) => void;
}

function TaskCard({
  task,
  users,
  onClick,
  onStatusClick,
  onUserClick,
}: TaskProps) {
  const assignedUser = users.find((user) => user.id === task.User_Id);

  const getStatusText = (task: Task) => {
    if (task.Done) return "Done";
    if (task.To_review) return "To Review";
    if (task.Work_in_progress) return "In Progress";
    return "To Do";
  };

  const getStatusValue = (
    task: Task
  ): "to-do" | "in-progress" | "to-review" | "done" => {
    if (task.Done) return "done";
    if (task.To_review) return "to-review";
    if (task.Work_in_progress) return "in-progress";
    return "to-do";
  };

  const getStatusClasses = (task: Task) => {
    if (task.Done)
      return "bg-gradient-to-r from-green-500 to-green-600 text-white";
    if (task.To_review)
      return "bg-gradient-to-r from-orange-500 to-orange-600 text-white";
    if (task.Work_in_progress)
      return "bg-gradient-to-r from-blue-400 to-blue-500 text-white";
    return "bg-gradient-to-r from-slate-400 to-slate-500 text-white";
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止觸發卡片的 onClick
    if (onStatusClick) {
      onStatusClick(getStatusValue(task));
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止觸發卡片的 onClick
    if (onUserClick && assignedUser) {
      onUserClick(assignedUser.id);
    }
  };

  const getUserDisplay = () => {
    if (!users || users.length === 0) {
      return <span className="text-gray-400">Loading users...</span>;
    }
    if (!assignedUser) {
      return <span className="text-yellow-600">Unassigned</span>;
    }
    return (
      <span
        onClick={handleUserClick}
        className="text-gray-700 hover:text-blue-600 cursor-pointer transition-colors"
      >
        {assignedUser.Name}
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-white via-slate-50 to-slate-100 
                backdrop-blur-sm border border-slate-200/60 
                rounded-2xl shadow-lg p-4 m-4
                transition-all duration-300 
                flex flex-col min-h-48
                hover:shadow-xl hover:-translate-y-1 hover:border-blue-200/30
                cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3 gap-2.5">
        <h3 className="text-xl font-bold text-slate-800 flex-1 leading-tight">
          {task.Content}
        </h3>
        <span
          onClick={handleStatusClick}
          className={`
            inline-block px-3 py-1.5 rounded-full text-xs font-bold 
            uppercase tracking-wide whitespace-nowrap min-w-fit 
            shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all
            cursor-pointer
            ${getStatusClasses(task)}
          `}
        >
          {getStatusText(task)}
        </span>
      </div>

      <div className="text-sm text-slate-600 mb-2 font-semibold flex items-center gap-2">
        <span>Assigned to:</span>
        {getUserDisplay()}
      </div>

      <div className="border-t border-slate-200 pt-3 mt-auto">
        <div className="text-xs text-slate-500 mb-1 font-medium">
          Created: {new Date(task.Created_At).toLocaleDateString()}
        </div>
        {task.Updated_At && (
          <div className="text-xs text-slate-500 font-medium">
            Updated: {new Date(task.Updated_At).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
