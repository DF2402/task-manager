export interface Worker {
    id: number;
    Name: string;
}

export interface CreateWorkerRequest {
    Name: string;
}

export interface UpdateWorkerRequest {
    Name?: string;
}
