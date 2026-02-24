import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/database.js";

import authRoutes from "./routes/auth.js";
import childrenRoutes from "./routes/children.js";
import attendanceRoutes from "./routes/attendance.js";
import reportRoutes from "./routes/reports.js";
import staffRoutes from "./routes/staff.js";
import logbookRoutes from "./routes/logbook.js";
import volunteersLogRoutes from "./routes/volunteersLog.js";

dotenv.config();

const app = express();

/* ==============================
   CORS CONFIG
============================== */
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

/* ==============================
   ROUTES
============================== */
app.use("/api/auth", authRoutes);
app.use("/api/children", childrenRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/logbook", logbookRoutes);
app.use("/api/volunteers-log", volunteersLogRoutes);

/* ==============================
   TEMP ADMIN CREATION ROUTE
   ⚠ REMOVE AFTER USE
============================== */
app.get("/create-admin", async (req, res) => {
  try {
    const bcrypt = await import("bcryptjs");

    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get("admin@ngo.com");

    if (existingUser) {
      return res.send("Admin already exists");
    }

    const hashedPassword = await bcrypt.default.hash("admin123", 10);

    db.prepare(
      `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `
    ).run("Admin", "admin@ngo.com", hashedPassword, "admin");

    res.send("Admin created successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating admin");
  }
});

/* ==============================
   HEALTH CHECK ROUTE
============================== */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* ==============================
   SERVER LISTEN
============================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});