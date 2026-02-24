import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, (req, res) => {
  const entries = db
    .prepare("SELECT * FROM volunteers_log ORDER BY arrivalTime DESC")
    .all();
  res.json(entries);
});

router.get("/today", verifyToken, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const entries = db
    .prepare(
      "SELECT * FROM volunteers_log WHERE date(arrivalTime) = ? ORDER BY arrivalTime DESC"
    )
    .all(today);
  res.json(entries);
});

router.post("/", verifyToken, (req, res) => {
  const { name, reason, arrivalTime } = req.body;
  db.prepare(
    "INSERT INTO volunteers_log (name, reason, arrivalTime) VALUES (?, ?, ?)"
  ).run(name, reason || null, arrivalTime);
  res.json({ message: "Arrival logged" });
});

router.put("/:id/departure", verifyToken, (req, res) => {
  const { departureTime } = req.body;
  db.prepare("UPDATE volunteers_log SET departureTime = ? WHERE id = ?").run(
    departureTime,
    req.params.id
  );
  res.json({ message: "Departure logged" });
});

export default router;
