const express = require("express");
const router = express.Router();
const {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/auth");

// Dashboard is accessible by analyst and admin (not viewer)
router.use(protect);
router.use(authorize("analyst", "admin"));

router.get("/summary", getSummary);
router.get("/category-totals", getCategoryTotals);
router.get("/monthly-trends", getMonthlyTrends);
router.get("/weekly-trends", getWeeklyTrends);
router.get("/recent", getRecentActivity);

module.exports = router;