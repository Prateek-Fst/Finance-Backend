const Record = require("../models/Record");

// GET /api/dashboard/summary
const getSummary = async (req, res, next) => {
  try {
    const result = await Record.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    result.forEach((item) => {
      if (item._id === "income") {
        totalIncome = item.total;
        incomeCount = item.count;
      } else {
        totalExpenses = item.total;
        expenseCount = item.count;
      }
    });

    res.json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        incomeCount,
        expenseCount,
        totalRecords: incomeCount + expenseCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/category-totals
const getCategoryTotals = async (req, res, next) => {
  try {
    const { type } = req.query; // optional: filter by income or expense
    const match = { isDeleted: false };
    if (type) match.type = type;

    const result = await Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const formatted = result.map((item) => ({
      category: item._id.category,
      type: item._id.type,
      total: item.total,
      count: item.count,
    }));

    res.json({ success: true, categoryTotals: formatted });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/monthly-trends
const getMonthlyTrends = async (req, res, next) => {
  try {
    const { year } = req.query;
    const matchYear = year ? Number(year) : new Date().getFullYear();

    const result = await Record.aggregate([
      {
        $match: {
          isDeleted: false,
          date: {
            $gte: new Date(`${matchYear}-01-01`),
            $lte: new Date(`${matchYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Build 12-month structured response
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(matchYear, i, 1).toLocaleString("default", { month: "long" }),
      income: 0,
      expense: 0,
    }));

    result.forEach((item) => {
      const monthIndex = item._id.month - 1;
      if (item._id.type === "income") {
        months[monthIndex].income = item.total;
      } else {
        months[monthIndex].expense = item.total;
      }
    });

    months.forEach((m) => {
      m.net = m.income - m.expense;
    });

    res.json({ success: true, year: matchYear, monthlyTrends: months });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/weekly-trends
const getWeeklyTrends = async (req, res, next) => {
  try {
    // Last 8 weeks
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const result = await Record.aggregate([
      {
        $match: {
          isDeleted: false,
          date: { $gte: eightWeeksAgo },
        },
      },
      {
        $group: {
          _id: {
            week: { $isoWeek: "$date" },
            year: { $isoWeekYear: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ]);

    res.json({ success: true, weeklyTrends: result });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/recent
const getRecentActivity = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const records = await Record.find({ isDeleted: false })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, recentActivity: records });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
};