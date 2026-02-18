import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, (req, res) => {
  const volunteers = db.prepare("SELECT * FROM volunteers").all();
  res.json(volunteers);
});

router.post("/", verifyToken, (req, res) => {
  const { name, email, phone, role } = req.body;
  db.prepare(
    "INSERT INTO volunteers (name, email, phone, role) VALUES (?, ?, ?, ?)"
  ).run(name, email, phone, role);
  res.json({ message: "Volunteer added" });
});

router.put("/:id", verifyToken, (req, res) => {
  const { name, email, phone, role } = req.body;
  db.prepare(
    "UPDATE volunteers SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?"
  ).run(name, email, phone, role, req.params.id);
  res.json({ message: "Volunteer updated" });
});

router.delete("/:id", verifyToken, (req, res) => {
  db.prepare("DELETE FROM volunteers WHERE id = ?").run(req.params.id);
  res.json({ message: "Volunteer deleted" });
});

export default router;
