import { Worker, CreateWorkerRequest, UpdateWorkerRequest } from '../models/worker';
export declare class WorkerService {
    private getDb;
    getAllWorkers(): Promise<Worker[]>;
    getWorkerById(id: number): Promise<Worker | null>;
    createWorker(data: CreateWorkerRequest): Promise<Worker>;
    updateWorker(id: number, data: UpdateWorkerRequest): Promise<Worker | null>;
    deleteWorker(id: number): Promise<boolean>;
}
//# sourceMappingURL=WorkerService.d.ts.map