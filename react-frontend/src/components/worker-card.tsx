import '../styles/Card.css';    

interface WorkerCardProps {
    worker: {
        id: number;
        Name: string;
    };
}

function WorkerCard({ worker }: WorkerCardProps) {
    return (
        <div className="worker-card card">
            <div className="worker-id card-content">Worker ID: {worker.id}</div>
            <div className="worker-name card-content">Worker Name: {worker.Name}</div>
        </div>
    );
}

export default WorkerCard;