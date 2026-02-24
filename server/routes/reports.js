import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard-stats", verifyToken, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const childrenTotal = db.prepare("SELECT COUNT(*) as count FROM children").get().count;
  const childrenIn = db.prepare("SELECT COUNT(*) as count FROM children WHERE status = 'in'").get().count;
  const childrenOut = db.prepare("SELECT COUNT(*) as count FROM children WHERE status = 'out'").get().count;

  const staffTotal = db.prepare("SELECT COUNT(*) as count FROM staff").get().count;
  const staffIn = db.prepare("SELECT COUNT(*) as count FROM staff WHERE status = 'in'").get().count;
  const staffOut = db.prepare("SELECT COUNT(*) as count FROM staff WHERE status = 'out'").get().count;

  const volunteersToday = db
    .prepare("SELECT COUNT(*) as count FROM volunteers_log WHERE date(arrivalTime) = ?")
    .get(today).count;

  res.json({
    children: { total: childrenTotal, in: childrenIn, out: childrenOut },
    staff: { total: staffTotal, in: staffIn, out: staffOut },
    volunteers: { totalToday: volunteersToday },
  });
});

router.get("/attendance/children", verifyToken, (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  const allChildren = db.prepare("SELECT id, age FROM children").all();
  const attendanceRecords = db
    .prepare("SELECT childId, status FROM attendance_children WHERE date = ?")
    .all(date);

  const attendanceMap = {};
  for (const r of attendanceRecords) {
    attendanceMap[r.childId] = r.status;
  }

  const ageGroups = {};
  for (const child of allChildren) {
    if (!ageGroups[child.age]) {
      ageGroups[child.age] = { age: child.age, total: 0, present: 0, absent: 0 };
    }
    ageGroups[child.age].total++;
    const status = attendanceMap[child.id];
    if (status === "present") ageGroups[child.age].present++;
    else if (status === "absent") ageGroups[child.age].absent++;
  }

  const result = Object.values(ageGroups)
    .map((g) => ({
      ...g,
      percentage: g.total > 0 ? Math.round((g.present / g.total) * 100) : 0,
    }))
    .sort((a, b) => a.age - b.age);

  res.json(result);
});

router.get("/attendance/staff", verifyToken, (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  const allStaff = db.prepare("SELECT id, name FROM staff ORDER BY name").all();
  const attendanceRecords = db
    .prepare("SELECT staffId, status, reason FROM attendance_staff WHERE date = ?")
    .all(date);

  const attendanceMap = {};
  for (const r of attendanceRecords) {
    attendanceMap[r.staffId] = { status: r.status, reason: r.reason };
  }

  const result = allStaff.map((s) => ({
    staffId: s.id,
    name: s.name,
    status: attendanceMap[s.id]?.status || null,
    reason: attendanceMap[s.id]?.reason || null,
  }));

  res.json(result);
});

router.get("/volunteers-log", verifyToken, (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const entries = db
    .prepare(
      "SELECT * FROM volunteers_log WHERE date(arrivalTime) = ? ORDER BY arrivalTime"
    )
    .all(date);
  res.json(entries);
});

export default router;
