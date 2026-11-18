const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const { resetDemoData } = require('../db/demoSeed');

// POST /demo/reset (protected)
const resetDemo = async (req, res) => {
  const user = await userModel.findById(req.userId);
  if (!user?.is_demo) {
    throw AppError.forbidden('demo_only', 'Only the demo account can be reset');
  }
  await resetDemoData(user.id);
  res.status(204).end();
};

module.exports = { resetDemo };