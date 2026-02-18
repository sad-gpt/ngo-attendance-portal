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
  const totalVolunteers = db.prepare("SELECT COUNT(*) as count FROM volunteers").get().count;
  const today = new Date().toISOString().slice(0, 10);
  const attendanceToday = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = 'present'").get(today).count;

  res.json({
    totalChildren,
    totalVolunteers,
    attendanceToday
  });
});

export default router;
