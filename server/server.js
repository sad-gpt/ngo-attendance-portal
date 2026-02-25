import "dotenv/config"; // MUST stay first

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import childrenRoutes from "./routes/children.js";
import attendanceRoutes from "./routes/attendance.js";
import reportRoutes from "./routes/reports.js";
import staffRoutes from "./routes/staff.js";
import logbookRoutes from "./routes/logbook.js";
import volunteersLogRoutes from "./routes/volunteersLog.js";

const app = express();

/* ==============================
   CORS CONFIG
============================== */
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS not allowed for origin: ${origin}`));
    },
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
   ROOT CHECK
============================== */
app.get("/", (req, res) => {
  res.status(200).send("Backend is running 🚀");
});

/* ==============================
   HEALTH CHECK (for uptime monitor)
============================== */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/* ==============================
   404 — Any unknown route
============================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ==============================
   GLOBAL ERROR HANDLER
============================== */
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);

  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

/* ==============================
   SERVER START
============================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});