const userModel = require('../models/userModel');
const { validateCreateUser } = require('../validators/userValidator');

// POST /users
const createUser = async (req, res) => {
  const body = req.body || {};
  validateCreateUser(body);

  const user = await userModel.create(body);
  res.status(201).json(user);
};

module.exports = { createUser };