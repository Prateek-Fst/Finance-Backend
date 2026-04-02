require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Record = require("../models/Record");
const connectDB = require("../config/db");

const clearDb = async () => {
  await connectDB();

  const users = await User.deleteMany({});
  const records = await Record.deleteMany({});

  console.log("\n🗑️  Database cleared!");
  console.log(`   Users deleted   : ${users.deletedCount}`);
  console.log(`   Records deleted : ${records.deletedCount}\n`);

  process.exit(0);
};

clearDb().catch((err) => {
  console.error("Clear failed:", err);
  process.exit(1);
});
