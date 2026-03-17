const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordMinLength = 8;

export function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

export function validateEmail(value) {
  const email = normalizeEmail(value ?? '');

  if (!email) {
    return 'Enter the email address tied to your Fundly account.';
  }

  if (!emailPattern.test(email)) {
    return 'Use a valid email address, like name@example.com.';
  }

  return '';
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  const emailError = validateEmail(email);

  if (emailError) {
    errors.email = emailError;
  }

  if (!password.trim()) {
    errors.password = 'Enter your password to continue.';
  }

  return errors;
}

export function validateForgotPasswordForm({ email }) {
  const errors = {};
  const emailError = validateEmail(email);

  if (emailError) {
    errors.email = emailError;
  }

  return errors;
}

export function validateResetPasswordForm({ password, confirmPassword }) {
  const errors = {};

  if (!password) {
    errors.password = 'Create a new password to secure your account.';
  } else if (password.length < passwordMinLength) {
    errors.password = `Use at least ${passwordMinLength} characters for a stronger password.`;
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm your new password to make sure it matches.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Those passwords do not match yet.';
  }

  return errors;
}
