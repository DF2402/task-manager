import { Request, Response, NextFunction } from 'express';
export declare class AttendanceController {
    private db;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByWorkerId(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=AttendanceController.d.ts.map