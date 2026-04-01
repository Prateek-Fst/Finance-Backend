const Record = require("../models/Record");

// GET /api/records
const getAllRecords = async (req, res, next) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = "date",
      order = "desc",
    } = req.query;

    // Build filter - always exclude soft-deleted records
    const filter = { isDeleted: false };

    if (type) filter.type = type;
    if (category) filter.category = category;

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const [records, total] = await Promise.all([
      Record.find(filter)
        .populate("createdBy", "name email")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Record.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      records,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/records/:id
const getRecordById = async (req, res, next) => {
  try {
    const record = await Record.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("createdBy", "name email");

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found." });
    }

    res.json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

// POST /api/records  (admin only)
const createRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    const record = await Record.create({
      amount,
      type,
      category,
      date: date || Date.now(),
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Record created successfully.",
      record,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/records/:id  (admin only)
const updateRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { amount, type, category, date, notes },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found." });
    }

    res.json({ success: true, message: "Record updated.", record });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/records/:id  (admin only) - soft delete
const deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found." });
    }

    res.json({ success: true, message: "Record deleted (soft delete)." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
};