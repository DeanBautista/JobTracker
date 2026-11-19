process.env.ACCESS_TOKEN_SECRET = 'test-secret-for-jest';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.GOOGLE_CLIENT_ID = 'test-google-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:5000/auth/google/callback';
process.env.GITHUB_CLIENT_ID = 'test-github-id';
process.env.GITHUB_CLIENT_SECRET = 'test-github-secret';
process.env.GITHUB_REDIRECT_URI = 'http://localhost:5000/auth/github/callback';

// Mocked for every test file: no database, no real emails.
jest.mock('./db/knex', () => ({
  raw: jest.fn(),
}));

jest.mock('./models/oauthModel', () => ({
  findOrCreateUser: jest.fn(),
}));

// A class (not jest.fn) so resetAllMocks can't wipe the constructor.
jest.mock('google-auth-library', () => {
  const verifyIdToken = jest.fn();
  return {
    OAuth2Client: class {
      verifyIdToken = verifyIdToken;
    },
    __verifyIdToken: verifyIdToken,
  };
});

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
  listBoard: jest.fn(),
  move: jest.fn(),
  // Plain arrays (not jest.fn), so resetAllMocks leaves them alone.
  STAGES: ['wishlist', 'applied', 'screening', 'interview', 'offer', 'accepted', 'rejected', 'withdrawn', 'ghosted'],
  CLOSE_REASONS: ['not_enough_experience', 'position_closed', 'salary_mismatch', 'took_another_offer', 'no_response', 'other'],
}));

jest.mock('./utils/mailer', () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

// Clears calls AND implementations, so each test sets up exactly what it needs.
afterEach(() => {
  jest.resetAllMocks();
});