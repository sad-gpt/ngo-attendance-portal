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

export default router;
