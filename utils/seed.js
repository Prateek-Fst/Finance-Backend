require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Record = require("../models/Record");
const connectDB = require("../config/db");

const categories = [
  "salary", "freelance", "investment",
  "rent", "food", "transport", "utilities",
  "entertainment", "healthcare", "education", "shopping", "other",
];

const seed = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await User.deleteMany({});
  await Record.deleteMany({});

  console.log("Creating users...");
  const admin = await User.create({
    name: "Admin User",
    email: "admin@finance.com",
    password: "admin123",
    role: "admin",
    status: "active",
  });

  const analyst = await User.create({
    name: "Analyst User",
    email: "analyst@finance.com",
    password: "analyst123",
    role: "analyst",
    status: "active",
  });

  await User.create({
    name: "Viewer User",
    email: "viewer@finance.com",
    password: "viewer123",
    role: "viewer",
    status: "active",
  });

  console.log("Creating financial records...");
  const records = [];

  // Generate 50 records across last 12 months
  for (let i = 0; i < 50; i++) {
    const isIncome = Math.random() > 0.5;
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    records.push({
      amount: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
      type: isIncome ? "income" : "expense",
      category: isIncome
        ? ["salary", "freelance", "investment"][Math.floor(Math.random() * 3)]
        : categories.slice(3)[Math.floor(Math.random() * (categories.length - 3))],
      date,
      notes: `Auto-generated record ${i + 1}`,
      createdBy: Math.random() > 0.5 ? admin._id : analyst._id,
    });
  }

  await Record.insertMany(records);

  console.log("\n✅ Seed completed!");
  console.log("─────────────────────────────────────");
  console.log("Demo Credentials:");
  console.log("  Admin   → admin@finance.com   / admin123");
  console.log("  Analyst → analyst@finance.com / analyst123");
  console.log("  Viewer  → viewer@finance.com  / viewer123");
  console.log("─────────────────────────────────────\n");

  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});