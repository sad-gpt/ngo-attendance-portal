import express from "express";
import prisma from "../config/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Children Attendance ──────────────────────────────────────────────────────

router.get("/children", verifyToken, async (req, res) => {
  const records = await prisma.attendanceChild.findMany({
    include: { child: { select: { name: true, age: true } } },
    orderBy: [{ date: "desc" }, { child: { age: "asc" } }, { child: { name: "asc" } }],
  });
  res.json(
    records.map((r) => ({
      id: r.id,
      childId: r.childId,
      date: r.date,
      status: r.status,
      reason: r.reason,
      childName: r.child.name,
      age: r.child.age,
    }))
  );
});

router.get("/children/today", verifyToken, async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const records = await prisma.attendanceChild.findMany({
    where: { date: today },
    include: { child: { select: { name: true, age: true } } },
    orderBy: [{ child: { age: "asc" } }, { child: { name: "asc" } }],
  });
  res.json(
    records.map((r) => ({
      id: r.id,
      childId: r.childId,
      date: r.date,
      status: r.status,
      reason: r.reason,
      childName: r.child.name,
      age: r.child.age,
    }))
  );
});

router.post("/children/mark", verifyToken, async (req, res) => {
  const { records } = req.body;
  await prisma.$transaction(
    records.map((r) =>
      prisma.attendanceChild.upsert({
        where: { childId_date: { childId: r.childId, date: r.date } },
        update: { status: r.status, reason: r.reason || null },
        create: { childId: r.childId, date: r.date, status: r.status, reason: r.reason || null },
      })
    )
  );
  res.json({ message: "Children attendance saved" });
});

// ── Staff Attendance ─────────────────────────────────────────────────────────

router.get("/staff", verifyToken, async (req, res) => {
  const records = await prisma.attendanceStaff.findMany({
    include: { staff: { select: { name: true } } },
    orderBy: [{ date: "desc" }, { staff: { name: "asc" } }],
  });
  res.json(
    records.map((r) => ({
      id: r.id,
      staffId: r.staffId,
      date: r.date,
      status: r.status,
      reason: r.reason,
      staffName: r.staff.name,
    }))
  );
});

router.get("/staff/today", verifyToken, async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const records = await prisma.attendanceStaff.findMany({
    where: { date: today },
    include: { staff: { select: { name: true } } },
    orderBy: [{ staff: { name: "asc" } }],
  });
  res.json(
    records.map((r) => ({
      id: r.id,
      staffId: r.staffId,
      date: r.date,
      status: r.status,
      reason: r.reason,
      staffName: r.staff.name,
    }))
  );
});

router.post("/staff/mark", verifyToken, async (req, res) => {
  const { records } = req.body;
  await prisma.$transaction(
    records.map((r) =>
      prisma.attendanceStaff.upsert({
        where: { staffId_date: { staffId: r.staffId, date: r.date } },
        update: { status: r.status, reason: r.reason || null },
        create: { staffId: r.staffId, date: r.date, status: r.status, reason: r.reason || null },
      })
    )
  );
  res.json({ message: "Staff attendance saved" });
});

export default router;
