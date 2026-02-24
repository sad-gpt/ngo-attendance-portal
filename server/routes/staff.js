import express from "express";
import prisma from "../config/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const staff = await prisma.staff.findMany({ orderBy: { name: "asc" } });
  res.json(staff);
});

router.post("/", verifyToken, async (req, res) => {
  const { name, age, email } = req.body;
  try {
    await prisma.staff.create({ data: { name, age: age ? Number(age) : null, email } });
    res.json({ message: "Staff added" });
  } catch (err) {
    if (err.code === "P2002") return res.status(400).json({ message: "Email already exists" });
    throw err;
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { name, age, email } = req.body;
  try {
    await prisma.staff.update({
      where: { id: Number(req.params.id) },
      data: { name, age: age ? Number(age) : null, email },
    });
    res.json({ message: "Staff updated" });
  } catch (err) {
    if (err.code === "P2002") return res.status(400).json({ message: "Email already exists" });
    throw err;
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.$transaction([
    prisma.logbook.deleteMany({ where: { personId: id, type: "staff" } }),
    prisma.staff.delete({ where: { id } }),
  ]);
  res.json({ message: "Staff deleted" });
});

router.put("/:id/status", verifyToken, async (req, res) => {
  const { status } = req.body;
  if (!["in", "out"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'in' or 'out'" });
  }
  await prisma.staff.update({
    where: { id: Number(req.params.id) },
    data: { status },
  });
  res.json({ message: "Status updated" });
});

export default router;
