"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AttendanceController_1 = require("../controllers/AttendanceController");
const router = (0, express_1.Router)();
const attendanceController = new AttendanceController_1.AttendanceController();
// 考勤記錄路由
router.get('/', attendanceController.getAll.bind(attendanceController));
router.get('/worker/:workerId', attendanceController.getByWorkerId.bind(attendanceController));
exports.default = router;
//# sourceMappingURL=attendanceRoutes.js.map