import express from "express";
import prisma from "../config/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

function dayRange(dateStr) {
  return {
    gte: new Date(dateStr + "T00:00:00.000Z"),
    lt: new Date(dateStr + "T23:59:59.999Z"),
  };
}

async function enrichWithPersonName(entries) {
  const childIds = entries.filter((e) => e.type === "child").map((e) => e.personId);
  const staffIds = entries.filter((e) => e.type === "staff").map((e) => e.personId);
  const [children, staffMembers] = await Promise.all([
    childIds.length
      ? prisma.child.findMany({ where: { id: { in: childIds } }, select: { id: true, name: true } })
      : [],
    staffIds.length
      ? prisma.staff.findMany({ where: { id: { in: staffIds } }, select: { id: true, name: true } })
      : [],
  ]);
  const childMap = Object.fromEntries(children.map((c) => [c.id, c.name]));
  const staffMap = Object.fromEntries(staffMembers.map((s) => [s.id, s.name]));
  return entries.map((e) => ({
    ...e,
    personName: e.type === "child" ? childMap[e.personId] : staffMap[e.personId],
  }));
}

router.get("/", verifyToken, async (req, res) => {
  const { date } = req.query;
  const entries = await prisma.logbook.findMany({
    where: date ? { exitTime: dayRange(date) } : {},
    orderBy: { id: "desc" },
  });
  res.json(await enrichWithPersonName(entries));
});

router.get("/active", verifyToken, async (req, res) => {
  const entries = await prisma.logbook.findMany({
    where: { returnTime: null },
    orderBy: { id: "desc" },
  });
  res.json(await enrichWithPersonName(entries));
});

router.post("/", verifyToken, async (req, res) => {
  const { personId, type, reason, exitTime } = req.body;
  await prisma.$transaction(async (tx) => {
    await tx.logbook.create({
      data: { personId, type, reason: reason || null, exitTime: new Date(exitTime) },
    });
    if (type === "child") {
      await tx.child.update({ where: { id: personId }, data: { status: "out" } });
    } else if (type === "staff") {
      await tx.staff.update({ where: { id: personId }, data: { status: "out" } });
    }
  });
  res.json({ message: "Exit logged" });
});

router.put("/:id/return", verifyToken, async (req, res) => {
  const { returnTime } = req.body;
  const id = Number(req.params.id);
  const entry = await prisma.logbook.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ message: "Entry not found" });

  await prisma.$transaction(async (tx) => {
    await tx.logbook.update({ where: { id }, data: { returnTime: new Date(returnTime) } });
    if (entry.type === "child") {
      await tx.child.update({ where: { id: entry.personId }, data: { status: "in" } });
    } else if (entry.type === "staff") {
      await tx.staff.update({ where: { id: entry.personId }, data: { status: "in" } });
    }
  });
  res.json({ message: "Return logged" });
});

router.put("/:id", verifyToken, async (req, res) => {
  const { exitTime, returnTime, reason } = req.body;
  const id = Number(req.params.id);
  const entry = await prisma.logbook.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ message: "Entry not found" });

  await prisma.$transaction(async (tx) => {
    await tx.logbook.update({
      where: { id },
      data: {
        exitTime: exitTime ? new Date(exitTime) : null,
        returnTime: returnTime ? new Date(returnTime) : null,
        reason: reason || null,
      },
    });
    const newStatus = returnTime ? "in" : "out";
    if (entry.type === "child") {
      await tx.child.update({ where: { id: entry.personId }, data: { status: newStatus } });
    } else if (entry.type === "staff") {
      await tx.staff.update({ where: { id: entry.personId }, data: { status: newStatus } });
    }
  });
  res.json({ message: "Entry updated" });
});

router.delete("/:id", verifyToken, async (req, res) => {
  const id = Number(req.params.id);
  const entry = await prisma.logbook.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ message: "Entry not found" });

  await prisma.$transaction(async (tx) => {
    await tx.logbook.delete({ where: { id } });
    if (entry.type === "child") {
      await tx.child.update({ where: { id: entry.personId }, data: { status: "in" } });
    } else if (entry.type === "staff") {
      await tx.staff.update({ where: { id: entry.personId }, data: { status: "in" } });
    }
  });
  res.json({ message: "Entry deleted" });
});

export default router;
