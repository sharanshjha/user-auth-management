const User = require('../models/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/token');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    throw new AppError('Authentication token is missing', 401);
  }

  const token = header.split(' ')[1];
  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError('The user linked to this token no longer exists', 401);
  }

  req.user = {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  };

  next();
});

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    next(new AppError('You are not allowed to perform this action', 403));
    return;
  }

  next();
};

module.exports = {
  protect,
  authorize,
};
