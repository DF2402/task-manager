import { useState, useEffect } from 'react';
import { Worker } from '../types/worker';
import '../styles/Card.css';

interface AddWorkerCardProps {
    onWorkerAdded: () => void;
}

interface ApiResponse {
    success: boolean;
    data: Worker[];
    count: number;
}

function AddWorkerCard({ onWorkerAdded }: AddWorkerCardProps) {
    const [workerName, setWorkerName] = useState('');
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/workers');
            if (!response.ok) {
                throw new Error('Failed to fetch worker data');
            }
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setWorkers(result.data);
            } else {
                throw new Error('Invalid data format received from server');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching worker data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddWorker = async () => {
        if (!workerName.trim()) {
            alert('Please enter worker name');
            return;
        }

        // 檢查是否已存在相同名稱的工作人員
        if (workers.some(worker => worker.Name === workerName.trim())) {
            alert('Worker already exists');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/workers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Name: workerName.trim() })
            });

            if (!response.ok) {
                throw new Error('fail to add new worker');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error('Failed to add worker: ' + (result.message || 'Unknown error'));
            }

            // refresh worker list
            await fetchWorkers();
            // clear input field
            setWorkerName('');
            alert('Successfully added new worker');
            onWorkerAdded();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error adding new worker');
            alert('Error adding new worker');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="add-worker-card card">
            <h3 className="card-title">Add New Worker</h3>
            <div className="form-group card-content">
                <input 
                    type="text" 
                    placeholder="Enter Worker Name" 
                    onChange={(e) => setWorkerName(e.target.value)} 
                    value={workerName}
                    disabled={loading}
                    required 
                />
                <button 
                    onClick={handleAddWorker}
                    disabled={loading || !workerName.trim()}
                    className="add-btn"
                >
                    {loading ? 'Processing...' : 'Add New Worker'}
                </button>
            </div>
            {loading && <div className="loading">Loading...</div>}
        </div>
    );
}

export default AddWorkerCard;