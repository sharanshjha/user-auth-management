const normalizeEmail = (email = '') => email.trim().toLowerCase();

const isValidEmail = (email = '') => {
  const value = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const isValidName = (name = '') => {
  const value = name.trim();
  return value.length >= 2 && value.length <= 60;
};

const getPasswordValidationMessage = (password = '') => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }

  return null;
};

module.exports = {
  normalizeEmail,
  isValidEmail,
  isValidName,
  getPasswordValidationMessage,
};
