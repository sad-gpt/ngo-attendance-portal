import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, (req, res) => {
  const children = db.prepare("SELECT * FROM children").all();
  res.json(children);
});

router.post("/", verifyToken, (req, res) => {
  const { name, className, age, gender } = req.body;

  db.prepare(
    "INSERT INTO children (name, class, age, gender) VALUES (?, ?, ?, ?)"
  ).run(name, className, age, gender);

  res.json({ message: "Child added" });
});

router.put("/:id", verifyToken, (req, res) => {
  const { name, className, age, gender } = req.body;
  db.prepare(
    "UPDATE children SET name = ?, class = ?, age = ?, gender = ? WHERE id = ?"
  ).run(name, className, age, gender, req.params.id);
  res.json({ message: "Child updated" });
});

// DELETE /by-class must be registered BEFORE /:id
router.delete("/by-class", verifyToken, (req, res) => {
  const { className } = req.query;
  if (!className) return res.status(400).json({ message: "className required" });
  const tx = db.transaction((cls) => {
    db.prepare("DELETE FROM attendance WHERE childId IN (SELECT id FROM children WHERE class = ?)").run(cls);
    db.prepare("DELETE FROM children WHERE class = ?").run(cls);
  });
  tx(className);
  res.json({ message: "Class deleted" });
});

router.delete("/:id", verifyToken, (req, res) => {
  const tx = db.transaction((id) => {
    db.prepare("DELETE FROM attendance WHERE childId = ?").run(id);
    db.prepare("DELETE FROM children WHERE id = ?").run(id);
  });
  tx(req.params.id);
  res.json({ message: "Child deleted" });
});

export default router;
