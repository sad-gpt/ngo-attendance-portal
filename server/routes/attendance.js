import express from "express";
import db from "../config/database.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

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
