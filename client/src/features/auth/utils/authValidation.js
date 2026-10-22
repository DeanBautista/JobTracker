const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return "Email is required.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  return "";
}

export function validatePassword(value) {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return "";
}

export function validateName(value) {
  const name = value.trim();
  if (!name) return "Name is required.";
  if (name.length < 3) return "Name must be at least 3 characters.";
  return "";
}

export const signInValidators = {
  email: validateEmail,
  password: validatePassword,
};

export const signUpValidators = {
  name: validateName,
  email: validateEmail,
  password: validatePassword,
};