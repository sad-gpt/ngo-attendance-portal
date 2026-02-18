import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/database.js";

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user) return res.status(400).json({ message: "User not found" });

  const valid = bcrypt.compareSync(password, user.password);

  if (!valid) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  });
});

export default router;
