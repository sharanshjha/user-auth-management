const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_SECRET || 'dev-only-change-me';

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
  );

const verifyToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = {
  generateToken,
  verifyToken,
};
