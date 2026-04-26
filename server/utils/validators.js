/**
 * Validates strong password policies
 * Requires: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
 */
const isStrongPassword = (password) => {
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  return strongRegex.test(password);
};

/**
 * Basic email format validator
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  isStrongPassword,
  isValidEmail
};
