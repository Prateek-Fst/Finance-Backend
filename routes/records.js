const express = require("express");
const router = express.Router();
const {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
} = require("../controllers/recordController");
const { protect, authorize } = require("../middleware/auth");
const { validateRecord } = require("../middleware/validate");

// All routes require authentication
router.use(protect);

// Viewers, Analysts, and Admins can read records
router.get("/", authorize("viewer", "analyst", "admin"), getAllRecords);
router.get("/:id", authorize("viewer", "analyst", "admin"), getRecordById);

// Only Admins can create, update, delete
router.post("/", authorize("admin"), validateRecord, createRecord);
router.put("/:id", authorize("admin"), validateRecord, updateRecord);
router.delete("/:id", authorize("admin"), deleteRecord);

module.exports = router;