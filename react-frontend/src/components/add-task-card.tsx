import { useState, useEffect } from 'react';
import { Worker } from '../types/worker';
import '../styles/Card.css';

interface AddTaskCardProps {
    onTaskAdded: () => void;
}

function AddTaskCard({ onTaskAdded }: AddTaskCardProps) {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [selectedWorker, setSelectedWorker] = useState<number | ''>('');
    const [taskName, setTaskName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/workers');
            if (!response.ok) {
                throw new Error('Failed to fetch workers');
            }
            const data = await response.json();
            setWorkers(data.data);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch workers');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWorker || !taskName.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Content: taskName,
                    Worker_Id: selectedWorker,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add task');
            }

            setSuccessMessage('Task added successfully!');
            setTaskName('');
            setSelectedWorker('');
            setError(null);
            onTaskAdded(); // 調用父組件的更新函數

            // 3秒後清除成功訊息
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add task');
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="card">
            <h3>Add Task</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="worker-select">Select Worker:</label>
                    <select
                        className="card-select"
                        id="worker-select"
                        value={selectedWorker}
                        onChange={(e) => {
                            setSelectedWorker(e.target.value ? Number(e.target.value) : '');
                            setError(null);
                        }}
                    >
                        <option value="">Select Worker</option>
                        {workers.map(worker => (
                            <option key={worker.id} value={worker.id}>
                                {worker.Name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="task-name" className="card-content">Task Name:</label>
                    <input
                        className="card-input"
                        type="text"
                        id="task-name"
                        value={taskName}
                        onChange={(e) => {
                            setTaskName(e.target.value);
                            setError(null);
                        }}
                        placeholder="Please enter the task name"
                    />
                </div>

                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <div className="form-group">
                    <button type="submit" className="add-btn">
                        Add Task
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddTaskCard;