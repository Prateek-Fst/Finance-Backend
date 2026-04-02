const User = require("../models/User");

// GET /api/users  (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { status, role, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (role) filter.role = role;

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter).select("-password").skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id  (admin only)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id  (admin only) - update role or status
const updateUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot update your own account." });
    }

    const { role, status, name } = req.body;
    const allowed = {};

    if (role) {
      if (!["viewer", "analyst", "admin"].includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role." });
      }
      allowed.role = role;
    }

    if (status) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status." });
      }
      allowed.status = status;
    }

    if (name) allowed.name = name;

    const user = await User.findByIdAndUpdate(req.params.id, allowed, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, message: "User updated.", user });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id  (admin only)
const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };