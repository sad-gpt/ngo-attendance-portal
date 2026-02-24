import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Children Attendance ──────────────────────────────────────────────────────

router.get("/children", verifyToken, (req, res) => {
  const records = db
    .prepare(
      `SELECT ac.id, ac.childId, ac.date, ac.status, ac.reason,
              c.name AS childName, c.age
       FROM attendance_children ac
       JOIN children c ON ac.childId = c.id
       ORDER BY ac.date DESC, c.age, c.name`
    )
    .all();
  res.json(records);
});

router.get("/children/today", verifyToken, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const records = db
    .prepare(
      `SELECT ac.id, ac.childId, ac.date, ac.status, ac.reason,
              c.name AS childName, c.age
       FROM attendance_children ac
       JOIN children c ON ac.childId = c.id
       WHERE ac.date = ?
       ORDER BY c.age, c.name`
    )
    .all(today);
  res.json(records);
});

router.post("/children/mark", verifyToken, (req, res) => {
  const { records } = req.body;
  const upsert = db.prepare(
    "INSERT OR REPLACE INTO attendance_children (childId, date, status, reason) VALUES (?, ?, ?, ?)"
  );
  const transaction = db.transaction((recs) => {
    for (const r of recs) {
      upsert.run(r.childId, r.date, r.status, r.reason || null);
    }
  });
  transaction(records);
  res.json({ message: "Children attendance saved" });
});

// ── Staff Attendance ─────────────────────────────────────────────────────────

router.get("/staff", verifyToken, (req, res) => {
  const records = db
    .prepare(
      `SELECT ast.id, ast.staffId, ast.date, ast.status, ast.reason,
              s.name AS staffName
       FROM attendance_staff ast
       JOIN staff s ON ast.staffId = s.id
       ORDER BY ast.date DESC, s.name`
    )
    .all();
  res.json(records);
});

router.get("/staff/today", verifyToken, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const records = db
    .prepare(
      `SELECT ast.id, ast.staffId, ast.date, ast.status, ast.reason,
              s.name AS staffName
       FROM attendance_staff ast
       JOIN staff s ON ast.staffId = s.id
       WHERE ast.date = ?
       ORDER BY s.name`
    )
    .all(today);
  res.json(records);
});

router.post("/staff/mark", verifyToken, (req, res) => {
  const { records } = req.body;
  const upsert = db.prepare(
    "INSERT OR REPLACE INTO attendance_staff (staffId, date, status, reason) VALUES (?, ?, ?, ?)"
  );
  const transaction = db.transaction((recs) => {
    for (const r of recs) {
      upsert.run(r.staffId, r.date, r.status, r.reason || null);
    }
  });
  transaction(records);
  res.json({ message: "Staff attendance saved" });
});

export default router;
