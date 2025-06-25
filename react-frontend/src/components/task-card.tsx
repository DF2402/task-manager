import '../styles/Card.css';
import { Task } from '../types/task';
import { User } from '../types/user';

interface TaskProps {
    task: Task;
    users: User[];
    onClick?: () => void;
}

export const getStatusBadge = (task: Task) => {
    if (task.Done) {
        return <span className="status-badge done">Done</span>;
    }
    if (task.To_review) {
        return <span className="status-badge review">To Review</span>;
    }
    if (task.Work_in_progress) {
        return <span className="status-badge progress">In Progress</span>;
    }
    return <span className="status-badge todo">To Do</span>;
};

function TaskCard({ task, users, onClick }: TaskProps) {
    // determine the status badge based on the task status
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-TW');
    };

    return (
        <div className="card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            <div className="card-header">
                <div className="card-title">{task.Content}</div>
                {getStatusBadge(task)}
            </div>
            
            <div className="card-content">
                <div className="card-info">
                    {users.find(user => user.id === task.User_Id)?.Name}
                </div>
            </div>
            
            <div className="card-meta">
                <div className="card-info">Worker ID: {task.User_Id}</div>
                <div className="card-date">Created At: {formatDate(task.Created_At)}</div>
                <div className="card-date">Updated At: {formatDate(task.Updated_At)}</div>
            </div>
        </div>
    );
}

export default TaskCard;