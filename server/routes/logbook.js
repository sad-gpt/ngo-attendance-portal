import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, (req, res) => {
  const entries = db
    .prepare(
      `SELECT l.*,
              CASE WHEN l.type = 'child' THEN c.name ELSE s.name END AS personName
       FROM logbook l
       LEFT JOIN children c ON l.type = 'child' AND l.personId = c.id
       LEFT JOIN staff s ON l.type = 'staff' AND l.personId = s.id
       ORDER BY l.id DESC`
    )
    .all();
  res.json(entries);
});

router.get("/active", verifyToken, (req, res) => {
  const entries = db
    .prepare(
      `SELECT l.*,
              CASE WHEN l.type = 'child' THEN c.name ELSE s.name END AS personName
       FROM logbook l
       LEFT JOIN children c ON l.type = 'child' AND l.personId = c.id
       LEFT JOIN staff s ON l.type = 'staff' AND l.personId = s.id
       WHERE l.returnTime IS NULL
       ORDER BY l.id DESC`
    )
    .all();
  res.json(entries);
});

router.post("/", verifyToken, (req, res) => {
  const { personId, type, reason, exitTime } = req.body;
  const tx = db.transaction(() => {
    db.prepare(
      "INSERT INTO logbook (personId, type, reason, exitTime) VALUES (?, ?, ?, ?)"
    ).run(personId, type, reason || null, exitTime);
    if (type === "child") {
      db.prepare("UPDATE children SET status = 'out' WHERE id = ?").run(personId);
    } else if (type === "staff") {
      db.prepare("UPDATE staff SET status = 'out' WHERE id = ?").run(personId);
    }
  });
  tx();
  res.json({ message: "Exit logged" });
});

router.put("/:id/return", verifyToken, (req, res) => {
  const { returnTime } = req.body;
  const entry = db.prepare("SELECT * FROM logbook WHERE id = ?").get(req.params.id);
  if (!entry) return res.status(404).json({ message: "Entry not found" });
  const tx = db.transaction(() => {
    db.prepare("UPDATE logbook SET returnTime = ? WHERE id = ?").run(returnTime, req.params.id);
    if (entry.type === "child") {
      db.prepare("UPDATE children SET status = 'in' WHERE id = ?").run(entry.personId);
    } else if (entry.type === "staff") {
      db.prepare("UPDATE staff SET status = 'in' WHERE id = ?").run(entry.personId);
    }
  });
  tx();
  res.json({ message: "Return logged" });
});

export default router;
