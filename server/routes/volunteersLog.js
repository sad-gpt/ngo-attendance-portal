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

router.get("/", verifyToken, async (req, res) => {
  const entries = await prisma.volunteerLog.findMany({
    orderBy: { arrivalTime: "desc" },
  });
  res.json(entries);
});

router.get("/today", verifyToken, async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const entries = await prisma.volunteerLog.findMany({
    where: { arrivalTime: dayRange(today) },
    orderBy: { arrivalTime: "desc" },
  });
  res.json(entries);
});

router.post("/", verifyToken, async (req, res) => {
  const { name, reason, arrivalTime } = req.body;
  await prisma.volunteerLog.create({
    data: { name, reason: reason || null, arrivalTime: new Date(arrivalTime) },
  });
  res.json({ message: "Arrival logged" });
});

router.put("/:id/departure", verifyToken, async (req, res) => {
  const { departureTime } = req.body;
  await prisma.volunteerLog.update({
    where: { id: Number(req.params.id) },
    data: { departureTime: new Date(departureTime) },
  });
  res.json({ message: "Departure logged" });
});

router.put("/:id", verifyToken, async (req, res) => {
  const { name, reason, arrivalTime, departureTime } = req.body;
  await prisma.volunteerLog.update({
    where: { id: Number(req.params.id) },
    data: {
      name,
      reason: reason || null,
      arrivalTime: new Date(arrivalTime),
      departureTime: departureTime ? new Date(departureTime) : null,
    },
  });
  res.json({ message: "Entry updated" });
});

router.delete("/:id", verifyToken, async (req, res) => {
  await prisma.volunteerLog.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Entry deleted" });
});

export default router;
