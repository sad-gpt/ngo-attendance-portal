import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, (req, res) => {
  const staff = db.prepare("SELECT * FROM staff ORDER BY name").all();
  res.json(staff);
});

router.post("/", verifyToken, (req, res) => {
  const { name, age, email } = req.body;
  try {
    db.prepare("INSERT INTO staff (name, age, email) VALUES (?, ?, ?)").run(name, age, email);
    res.json({ message: "Staff added" });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(400).json({ message: "Email already exists" });
    }
    throw err;
  }
});

router.put("/:id", verifyToken, (req, res) => {
  const { name, age, email } = req.body;
  try {
    db.prepare("UPDATE staff SET name = ?, age = ?, email = ? WHERE id = ?").run(name, age, email, req.params.id);
    res.json({ message: "Staff updated" });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(400).json({ message: "Email already exists" });
    }
    throw err;
  }
});

router.delete("/:id", verifyToken, (req, res) => {
  const tx = db.transaction((id) => {
    db.prepare("DELETE FROM logbook WHERE personId = ? AND type = 'staff'").run(id);
    db.prepare("DELETE FROM staff WHERE id = ?").run(id);
  });
  tx(req.params.id);
  res.json({ message: "Staff deleted" });
});

router.put("/:id/status", verifyToken, (req, res) => {
  const { status } = req.body;
  if (!["in", "out"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'in' or 'out'" });
  }
  db.prepare("UPDATE staff SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ message: "Status updated" });
});

export default router;
