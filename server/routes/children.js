import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, (req, res) => {
  const children = db.prepare("SELECT * FROM children ORDER BY age, name").all();
  res.json(children);
});

router.post("/", verifyToken, (req, res) => {
  const { name, age, gender } = req.body;
  db.prepare("INSERT INTO children (name, age, gender) VALUES (?, ?, ?)").run(name, age, gender);
  res.json({ message: "Child added" });
});

router.put("/:id", verifyToken, (req, res) => {
  const { name, age, gender } = req.body;
  db.prepare("UPDATE children SET name = ?, age = ?, gender = ? WHERE id = ?").run(name, age, gender, req.params.id);
  res.json({ message: "Child updated" });
});

// DELETE /by-age must be registered BEFORE /:id
router.delete("/by-age", verifyToken, (req, res) => {
  const { age } = req.query;
  if (!age) return res.status(400).json({ message: "age required" });
  const tx = db.transaction((a) => {
    const childIds = db.prepare("SELECT id FROM children WHERE age = ?").all(a).map((c) => c.id);
    for (const id of childIds) {
      db.prepare("DELETE FROM logbook WHERE personId = ? AND type = 'child'").run(id);
    }
    db.prepare("DELETE FROM children WHERE age = ?").run(a);
  });
  tx(Number(age));
  res.json({ message: "Age group deleted" });
});

router.delete("/:id", verifyToken, (req, res) => {
  const tx = db.transaction((id) => {
    db.prepare("DELETE FROM logbook WHERE personId = ? AND type = 'child'").run(id);
    db.prepare("DELETE FROM children WHERE id = ?").run(id);
  });
  tx(req.params.id);
  res.json({ message: "Child deleted" });
});

router.put("/:id/status", verifyToken, (req, res) => {
  const { status } = req.body;
  if (!["in", "out"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'in' or 'out'" });
  }
  db.prepare("UPDATE children SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ message: "Status updated" });
});

export default router;
