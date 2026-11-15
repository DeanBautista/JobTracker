process.env.ACCESS_TOKEN_SECRET = 'test-secret-for-jest';

// Mocked for every test file: no database, no real emails.
jest.mock('./db/knex', () => ({
  raw: jest.fn(),
}));

jest.mock('./models/userModel', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAuthByEmail: jest.fn(),
  hashPassword: jest.fn(),
  recordFailedLogin: jest.fn(),
  clearFailedLogins: jest.fn(),
}));

jest.mock('./models/userTokenModel', () => ({
  createVerifyToken: jest.fn(),
  createResetToken: jest.fn(),
  sentRecently: jest.fn(),
  invalidateVerifyTokens: jest.fn(),
  invalidateResetTokens: jest.fn(),
  verifyEmail: jest.fn(),
  resetPassword: jest.fn(),
}));

jest.mock('./models/sessionModel', () => ({
  create: jest.fn(),
  findByHash: jest.fn(),
  rotate: jest.fn(),
  revoke: jest.fn(),
}));

jest.mock('./models/jobModel', () => ({
  create: jest.fn(),
  findDuplicate: jest.fn(),
  findById: jest.fn(),
  list: jest.fn(),
}));

jest.mock('./utils/mailer', () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

// Clears calls AND implementations, so each test sets up exactly what it needs.
afterEach(() => {
  jest.resetAllMocks();
});