const User = require('../models/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/token');
const {
  normalizeEmail,
  isValidEmail,
  isValidName,
  getPasswordValidationMessage,
} = require('../utils/validators');

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  if (!isValidName(name)) {
    throw new AppError('Name must be between 2 and 60 characters', 400);
  }

  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  const passwordMessage = getPasswordValidationMessage(password);
  if (passwordMessage) {
    throw new AppError(passwordMessage, 400);
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  const totalUsers = await User.estimatedDocumentCount();
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: totalUsers === 0 ? 'admin' : 'member',
  });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Account created',
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

module.exports = {
  register,
  login,
};
