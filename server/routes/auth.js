import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

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
      email: user.email,
      role: user.role,
    },
  });
});

router.post("/change-password", verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "currentPassword and newPassword required" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const valid = bcrypt.compareSync(currentPassword, user.password);
  if (!valid) return res.status(400).json({ message: "Current password is incorrect" });

  const hashed = bcrypt.hashSync(newPassword, 10);
  await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

  res.json({ message: "Password updated" });
});

router.post("/create-admin", verifyToken, async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, and password required" });
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return res.status(400).json({ message: "Email already in use" });

  const hashed = bcrypt.hashSync(password, 10);
  const newUser = await prisma.user.create({
    data: { name, email, password: hashed, role: "admin" },
  });

  res.json({ message: "Admin created", user: { id: newUser.id, name, email } });
});

export default router;
