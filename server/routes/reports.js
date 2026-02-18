import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/attendance", verifyToken, (req, res) => {
  const data = db.prepare(`
    SELECT children.name, attendance.date, attendance.status
    FROM attendance
    JOIN children ON attendance.childId = children.id
  `).all();

  res.json(data);
});

router.get("/dashboard-stats", verifyToken, (req, res) => {
  const totalChildren = db.prepare("SELECT COUNT(*) as count FROM children").get().count;
  const totalVolunteers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role='volunteer'").get().count;

  res.json({
    totalChildren,
    totalVolunteers,
    attendanceToday: 0
  });
});

export default router;
