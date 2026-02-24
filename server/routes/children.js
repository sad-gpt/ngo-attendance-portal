import express from "express";
import prisma from "../config/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const children = await prisma.child.findMany({
    orderBy: [{ age: "asc" }, { name: "asc" }],
  });
  res.json(children);
});

router.post("/", verifyToken, async (req, res) => {
  const { name, age, gender } = req.body;
  await prisma.child.create({ data: { name, age: Number(age), gender } });
  res.json({ message: "Child added" });
});

router.put("/:id", verifyToken, async (req, res) => {
  const { name, age, gender } = req.body;
  await prisma.child.update({
    where: { id: Number(req.params.id) },
    data: { name, age: Number(age), gender },
  });
  res.json({ message: "Child updated" });
});

// DELETE /by-age must be registered BEFORE /:id
router.delete("/by-age", verifyToken, async (req, res) => {
  const { age } = req.query;
  if (!age) return res.status(400).json({ message: "age required" });

  const childIds = (
    await prisma.child.findMany({
      where: { age: Number(age) },
      select: { id: true },
    })
  ).map((c) => c.id);

  await prisma.$transaction([
    prisma.logbook.deleteMany({ where: { personId: { in: childIds }, type: "child" } }),
    prisma.child.deleteMany({ where: { age: Number(age) } }),
  ]);

  res.json({ message: "Age group deleted" });
});

router.delete("/:id", verifyToken, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.$transaction([
    prisma.logbook.deleteMany({ where: { personId: id, type: "child" } }),
    prisma.child.delete({ where: { id } }),
  ]);
  res.json({ message: "Child deleted" });
});

router.put("/:id/status", verifyToken, async (req, res) => {
  const { status } = req.body;
  if (!["in", "out"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'in' or 'out'" });
  }
  await prisma.child.update({
    where: { id: Number(req.params.id) },
    data: { status },
  });
  res.json({ message: "Status updated" });
});

export default router;
