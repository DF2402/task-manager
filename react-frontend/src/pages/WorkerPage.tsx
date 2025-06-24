import WorkerCard from '../components/worker-card';
import { useState, useEffect } from 'react';
import '../styles/HomePage.css';
import AddWorkerCard from '../components/add-worker-card';

interface WorkerData {
    id: number;
    Name: string;
}

interface ApiResponse {
    success: boolean;
    data: WorkerData[];
    count: number;
}

function WorkerPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<WorkerData[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkerData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:3001/api/workers');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result: ApiResponse = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setData(result.data);
            } else {
                throw new Error('Invalid data format received from server');
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setError('Failed to load workers data. Please ensure the backend service is running.');
            setData([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchWorkerData();
    }, []);

    const handleWorkerAdded = () => {
        fetchWorkerData();
    };

    return (
        <div className="worker-page">
            <header className="page-header">
                <h1>Workers Management</h1>
                <div className="worker-count">
                    {!loading && !error && <span>Total Workers: {data.length}</span>}
                </div>
            </header>

            {loading && (
                <div className="loading-message">
                    <p>Loading workers data...</p>
                </div>
            )}

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && data.length === 0 && (
                <div className="no-data-message">
                    <p>No workers data</p>
                </div>
            )}

            {!loading && !error && data.length > 0 && (
                <div className="workers-grid">
                    {data.map((worker) => (
                        <WorkerCard key={worker.id} worker={worker} />
                    ))}
                </div>
            )}

            <AddWorkerCard onWorkerAdded={handleWorkerAdded} />
        </div>
    );
}

export default WorkerPage;