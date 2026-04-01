require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Connect to MongoDB
connectDB();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});
app.use("/api", limiter);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Finance Dashboard API is running.",
    version: "1.0.0",
    docs: "See README.md for API documentation",
  });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/records", require("./routes/records"));
app.use("/api/dashboard", require("./routes/dashboard"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// Central error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGO_URI}\n`);
});