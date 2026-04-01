// Simple manual validators - no extra library needed

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push("Name must be at least 2 characters.");
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    errors.push("Valid email is required.");
  if (!password || password.length < 6)
    errors.push("Password must be at least 6 characters.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push("Email is required.");
  if (!password) errors.push("Password is required.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }
  next();
};

const validateRecord = (req, res, next) => {
  const { amount, type, category, date } = req.body;
  const errors = [];

  if (amount === undefined || amount === null || isNaN(amount) || amount <= 0)
    errors.push("Amount must be a positive number.");
  if (!type || !["income", "expense"].includes(type))
    errors.push("Type must be 'income' or 'expense'.");
  if (!category) errors.push("Category is required.");
  if (date && isNaN(new Date(date).getTime()))
    errors.push("Date must be a valid date.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateRecord };