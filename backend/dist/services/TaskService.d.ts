import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task';
export declare class TaskService {
    private getDb;
    getAllTasks(): Promise<Task[]>;
    getTaskById(id: number): Promise<Task | null>;
    getTasksByWorkerId(workerId: number): Promise<Task[]>;
    createTask(data: CreateTaskRequest): Promise<Task>;
    updateTask(id: number, data: UpdateTaskRequest): Promise<Task | null>;
    deleteTask(id: number): Promise<boolean>;
}
//# sourceMappingURL=TaskService.d.ts.map