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

router.get("/dashboard-stats", verifyToken, async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const [childrenTotal, childrenIn, childrenOut, staffTotal, staffIn, staffOut, volunteersToday] =
    await Promise.all([
      prisma.child.count(),
      prisma.child.count({ where: { status: "in" } }),
      prisma.child.count({ where: { status: "out" } }),
      prisma.staff.count(),
      prisma.staff.count({ where: { status: "in" } }),
      prisma.staff.count({ where: { status: "out" } }),
      prisma.volunteerLog.count({ where: { arrivalTime: dayRange(today) } }),
    ]);

  res.json({
    children: { total: childrenTotal, in: childrenIn, out: childrenOut },
    staff: { total: staffTotal, in: staffIn, out: staffOut },
    volunteers: { totalToday: volunteersToday },
  });
});

router.get("/attendance/children", verifyToken, async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  const [allChildren, attendanceRecords] = await Promise.all([
    prisma.child.findMany({ orderBy: [{ age: "asc" }, { name: "asc" }] }),
    prisma.attendanceChild.findMany({ where: { date } }),
  ]);

  const attendanceMap = {};
  for (const r of attendanceRecords) {
    attendanceMap[r.childId] = { status: r.status, reason: r.reason };
  }

  const result = allChildren.map((c) => ({
    childId: c.id,
    name: c.name,
    gender: c.gender,
    age: c.age,
    status: attendanceMap[c.id]?.status || null,
    reason: attendanceMap[c.id]?.reason || null,
  }));

  res.json(result);
});

router.get("/attendance/staff", verifyToken, async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  const [allStaff, attendanceRecords] = await Promise.all([
    prisma.staff.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.attendanceStaff.findMany({ where: { date } }),
  ]);

  const attendanceMap = {};
  for (const r of attendanceRecords) {
    attendanceMap[r.staffId] = { status: r.status, reason: r.reason };
  }

  const result = allStaff.map((s) => ({
    staffId: s.id,
    name: s.name,
    status: attendanceMap[s.id]?.status || null,
    reason: attendanceMap[s.id]?.reason || null,
  }));

  res.json(result);
});

router.get("/volunteers-log", verifyToken, async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const entries = await prisma.volunteerLog.findMany({
    where: { arrivalTime: dayRange(date) },
    orderBy: { arrivalTime: "asc" },
  });
  res.json(entries);
});

export default router;
