// express app (exported for testing)

const express = require("express");
const cors = require("cors");
const path = require("path");
const reportRoutes = require("./routes/report.routes");
const uploadRoutes = require("./routes/upload.routes");
const authRoutes = require("./routes/auth.routes");
const statisticsRoutes = require("./routes/stats.routes");

const app = express();

app.use(
  cors({
    // Allow requests from any origin in development; tighten for production as needed
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/upload", uploadRoutes);

// Server uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Lightweight health endpoint used by frontend connectivity checks
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/statistics", statisticsRoutes);

module.exports = app;
