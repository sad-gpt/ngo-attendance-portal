import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, (req, res) => {
  const records = db.prepare(`
    SELECT attendance.id, attendance.date, attendance.status, children.name AS childName
    FROM attendance
    JOIN children ON attendance.childId = children.id
    ORDER BY attendance.id DESC
  `).all();
  res.json(records);
});

router.post("/", verifyToken, (req, res) => {
  const { childId, date, status } = req.body;
  db.prepare(
    "INSERT INTO attendance (childId, date, status) VALUES (?, ?, ?)"
  ).run(childId, date, status);
  res.json({ message: "Attendance recorded" });
});

router.post("/mark", verifyToken, (req, res) => {
  const { records } = req.body;

  const insert = db.prepare(
    "INSERT INTO attendance (childId, date, status) VALUES (?, ?, ?)"
  );

  const transaction = db.transaction((records) => {
    for (const r of records) {
      insert.run(r.childId, r.date, r.status);
    }
  });

  transaction(records);

  res.json({ message: "Attendance saved" });
});

export default router;
