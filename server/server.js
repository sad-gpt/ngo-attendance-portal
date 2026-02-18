import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import childrenRoutes from "./routes/children.js";
import attendanceRoutes from "./routes/attendance.js";
import reportRoutes from "./routes/reports.js";
import volunteerRoutes from "./routes/volunteers.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/children", childrenRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/volunteers", volunteerRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
