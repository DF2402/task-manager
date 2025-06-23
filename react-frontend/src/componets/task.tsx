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
    // 根據任務狀態決定顯示的類別
    const getStatusBadge = () => {
        if (task.Done) return <span className="status-badge done">已完成</span>;
        if (task.To_review) return <span className="status-badge review">待審核</span>;
        if (task.Work_in_progress) return <span className="status-badge progress">進行中</span>;
        return <span className="status-badge todo">待辦</span>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-TW');
    };

    return (
        <div className="task-card" style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            margin: '8px 0',
            backgroundColor: '#f9f9f9'
        }}>
            <div className="task-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="task-id">任務 #{task.id}</div>
                {getStatusBadge()}
            </div>
            
            <div className="task-content" style={{ margin: '12px 0', fontSize: '16px', fontWeight: 'bold' }}>
                {task.Content}
            </div>
            
            <div className="task-meta" style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
                <div className="worker-info">工作者ID: {task.Worker_Id}</div>
                <div className="created-date">創建時間: {formatDate(task.Created_At)}</div>
                <div className="updated-date">更新時間: {formatDate(task.Updated_At)}</div>
            </div>
        </div>
    );
}

export default Task;