import { useState, useEffect } from 'react';
import { User } from '../types/user';

export interface AddTaskCardProps {
    onTaskAdded: (taskContent: string, userId: number) => Promise<void>;
    users: User[];
}

function AddTaskCard({ onTaskAdded, users }: AddTaskCardProps) {
    const [loading, setLoading] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [selectedUser, setSelectedUser] = useState<number>(0);

    const handleAddTask = async () => {
        if (!taskName.trim() || selectedUser === 0) {
            alert('Please enter task content and select a user');
            return;
        }
        
        try {
            setLoading(true);
            await onTaskAdded(taskName, selectedUser);
            setTaskName('');
            setSelectedUser(0);
        } catch (error) {
            console.error('Failed to add task:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Adding task...</div>;
    }

    return (
       <div className="card">
        <div className="card-header">
            <div className="card-title">Add Task</div>
        </div>
        <div className="card-content">
            <div className="card-input">
                <input 
                    type="text" 
                    placeholder="Task Content" 
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                />
            </div>
                <select
                className="card-select" 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(Number(e.target.value))}
                >
                <option value={0}>Select User</option>
                {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.Name}</option>
                    ))}
                </select>
            <button className="card-button" onClick={handleAddTask}>
                Add Task
            </button>
            </div>
        </div>
    );
}

export default AddTaskCard;