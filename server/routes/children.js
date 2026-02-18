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

export default router;
