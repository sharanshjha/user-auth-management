const User = require('../models/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
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

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Profile loaded',
    data: {
      user: sanitizeUser(user),
    },
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Math.min(Number.parseInt(req.query.limit, 10) || 20, 100);
  const search = (req.query.q || '').trim();

  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Users loaded',
    data: {
      users: users.map(sanitizeUser),
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    },
  });
});

const updateOwnProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name && !email && !password) {
    throw new AppError('At least one field is required', 400);
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (name !== undefined) {
    if (!isValidName(name)) {
      throw new AppError('Name must be between 2 and 60 characters', 400);
    }
    user.name = name.trim();
  }

  if (email !== undefined) {
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      throw new AppError('Please provide a valid email address', 400);
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.id !== user.id) {
      throw new AppError('Email already in use', 409);
    }

    user.email = normalizedEmail;
  }

  if (password !== undefined) {
    const passwordMessage = getPasswordValidationMessage(password);
    if (passwordMessage) {
      throw new AppError(passwordMessage, 400);
    }
    user.password = password;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated',
    data: {
      user: sanitizeUser(user),
    },
  });
});

const deleteOwnProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      throw new AppError('Cannot delete the last admin account', 400);
    }
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Your account was deleted',
  });
});

const updateUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  if (!name && !email && !role) {
    throw new AppError('At least one field is required', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (name !== undefined) {
    if (!isValidName(name)) {
      throw new AppError('Name must be between 2 and 60 characters', 400);
    }
    user.name = name.trim();
  }

  if (email !== undefined) {
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      throw new AppError('Please provide a valid email address', 400);
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.id !== user.id) {
      throw new AppError('Email already in use', 409);
    }

    user.email = normalizedEmail;
  }

  if (role !== undefined) {
    if (!['admin', 'member'].includes(role)) {
      throw new AppError("Role must be either 'admin' or 'member'", 400);
    }

    if (user.role === 'admin' && role === 'member') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        throw new AppError('Cannot demote the last admin account', 400);
      }
    }

    user.role = role;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated',
    data: {
      user: sanitizeUser(user),
    },
  });
});

const deleteUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      throw new AppError('Cannot delete the last admin account', 400);
    }
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted',
    data: {
      user: sanitizeUser(user),
    },
  });
});

module.exports = {
  getCurrentUser,
  listUsers,
  updateOwnProfile,
  deleteOwnProfile,
  updateUserById,
  deleteUserById,
};
