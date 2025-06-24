import '../styles/Task.css';

interface TaskProps {
    task: {
        id: number;
        Content: string;
        Worker_Id: number;
        Work_in_progress: boolean;
        To_review: boolean;
        Done: boolean;
        Created_At: string;
        Updated_At: string;
    };
}

function Task({ task }: TaskProps) {
    // determine the status badge based on the task status
    const getStatusBadge = () => {
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-TW');
    };

    return (
        <div className="task-card">
            <div className="task-header">
                <div className="task-id">Task #{task.id}</div>
                {getStatusBadge()}
            </div>
            
            <div className="task-content">
                {task.Content}
            </div>
            
            <div className="task-meta">
                <div className="worker-info">Worker ID: {task.Worker_Id}</div>
                <div className="created-date">Created At: {formatDate(task.Created_At)}</div>
                <div className="updated-date">Updated At: {formatDate(task.Updated_At)}</div>
            </div>
        </div>
    );
}

export default Task;