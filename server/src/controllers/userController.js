const userModel = require('../models/userModel');
const userTokenModel = require('../models/userTokenModel');
const { sendVerificationEmail } = require('../utils/mailer');
const { validateCreateUser } = require('../validators/userValidator');
const AppError = require('../utils/AppError');

// POST /users
const createUser = async (req, res) => {
  const body = req.body || {};
  validateCreateUser(body);

  const user = await userModel.create(body);

  // The account exists even if the email fails; the user can request a new link.
  try {
    const token = await userTokenModel.createVerifyToken(user.id);
    await sendVerificationEmail({ to: user.email, name: user.name, token });
  } catch (err) {
    console.error('Failed to send verification email:', err);
  }

  res.status(201).json(user);
};

// POST /users/me/onboarding (protected)
const completeOnboarding = async (req, res) => {
  const user = await userModel.completeOnboarding(req.userId);
  if (!user) throw AppError.unauthorized('invalid_token');
  res.json(user);
};

module.exports = { createUser, completeOnboarding };