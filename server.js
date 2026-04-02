require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Connect to MongoDB
connectDB();

// CORS - Allow all origins for API documentation and cross-origin requests
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

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

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Finance Dashboard API Docs",
  swaggerOptions: { persistAuthorization: true },
}));

// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

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
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://finance-backend-fxvz.onrender.com' 
  : `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`Server running on ${BASE_URL}`);
  console.log(`API Docs: ${BASE_URL}/api-docs`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB: ${process.env.MONGO_URI}\n`);
});