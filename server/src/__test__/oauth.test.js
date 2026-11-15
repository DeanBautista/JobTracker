const request = require('supertest');
const oauthModel = require('../models/oauthModel');
const sessionModel = require('../models/sessionModel');
const { __verifyIdToken: verifyIdToken } = require('google-auth-library');
const app = require('../app');

const CLIENT = 'http://localhost:5173';
const json = (body, ok = true) => ({ ok, json: async () => body });
const tmpCookie = (provider, state = 's1') =>
  `oauth_${provider}=${encodeURIComponent(JSON.stringify({ verifier: 'v', state }))}`;

describe('GET /auth/:provider (start)', () => {
  test.each([
    ['google', 'accounts.google.com'],
    ['github', 'github.com'],
  ])('%s redirects with PKCE S256 and a state cookie', async (provider, host) => {
    const res = await request(app).get(`/auth/${provider}`);

    expect(res.statusCode).toBe(302);
    const url = new URL(res.headers.location);
    expect(url.host).toBe(host);
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('code_challenge')).toBeTruthy();

    const cookie = res.headers['set-cookie'].find((c) => c.startsWith(`oauth_${provider}=`));
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Path=/auth');
    const saved = JSON.parse(decodeURIComponent(cookie.split(';')[0].split('=')[1]));
    expect(url.searchParams.get('state')).toBe(saved.state);
  });
});

describe('GET /auth/:provider/callback (rejections)', () => {
  test('redirects oauth_denied when the user cancels', async () => {
    const res = await request(app)
      .get('/auth/github/callback?error=access_denied')
      .set('Cookie', tmpCookie('github'));

    expect(res.headers.location).toBe(`${CLIENT}/login?error=oauth_denied`);
  });

  test('redirects oauth_failed when the state cookie is missing', async () => {
    const res = await request(app).get('/auth/github/callback?code=abc&state=s1');

    expect(res.headers.location).toBe(`${CLIENT}/login?error=oauth_failed`);
    expect(oauthModel.findOrCreateUser).not.toHaveBeenCalled();
  });

  test('redirects oauth_failed when state does not match', async () => {
    const res = await request(app)
      .get('/auth/github/callback?code=abc&state=other')
      .set('Cookie', tmpCookie('github', 's1'));

    expect(res.headers.location).toBe(`${CLIENT}/login?error=oauth_failed`);
    expect(oauthModel.findOrCreateUser).not.toHaveBeenCalled();
    expect(sessionModel.create).not.toHaveBeenCalled();
  });

  test('redirects oauth_failed when the provider API errors, without a session', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn().mockResolvedValueOnce(json({ error: 'bad_code' }, false));

    const res = await request(app)
      .get('/auth/github/callback?code=abc&state=s1')
      .set('Cookie', tmpCookie('github'));

    expect(res.headers.location).toBe(`${CLIENT}/login?error=oauth_failed`);
    expect(sessionModel.create).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('GET /auth/github/callback', () => {
  const mockGithub = (emails) => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(json({ access_token: 'gh-token' }))
      .mockResolvedValueOnce(
        json({ id: 99, login: 'tamaki', name: 'Tamaki', avatar_url: 'http://a/b.png' })
      )
      .mockResolvedValueOnce(json(emails));
  };

  test('signs in: starts a session, sets the refresh cookie, redirects to the dashboard', async () => {
    mockGithub([{ email: 'tamaki@gmail.com', primary: true, verified: true }]);
    oauthModel.findOrCreateUser.mockResolvedValue(147);

    const res = await request(app)
      .get('/auth/github/callback?code=abc&state=s1')
      .set('Cookie', tmpCookie('github'));

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(`${CLIENT}/dashboard`);
    expect(oauthModel.findOrCreateUser).toHaveBeenCalledWith(
      'github',
      expect.objectContaining({ providerUserId: '99', email: 'tamaki@gmail.com' })
    );

    const refresh = res.headers['set-cookie'].find((c) => c.startsWith('refresh_token='));
    expect(refresh).toMatch(/^refresh_token=[0-9a-f]{96};/);
    expect(refresh).toContain('HttpOnly');
    expect(sessionModel.create.mock.calls[0][0].userId).toBe(147);

    // temp PKCE cookie is cleared
    expect(res.headers['set-cookie'].some((c) => c.startsWith('oauth_github=;'))).toBe(true);
  });

  test('rejects when there is no verified primary email', async () => {
    mockGithub([{ email: 'tamaki@gmail.com', primary: true, verified: false }]);

    const res = await request(app)
      .get('/auth/github/callback?code=abc&state=s1')
      .set('Cookie', tmpCookie('github'));

    expect(res.headers.location).toBe(`${CLIENT}/login?error=oauth_email_unverified`);
    expect(oauthModel.findOrCreateUser).not.toHaveBeenCalled();
    expect(sessionModel.create).not.toHaveBeenCalled();
  });
});

describe('GET /auth/google/callback', () => {
  const mockGoogle = (payload) => {
    global.fetch = jest.fn().mockResolvedValueOnce(json({ id_token: 'idt' }));
    verifyIdToken.mockResolvedValue({ getPayload: () => payload });
  };

  test('signs in with a verified id_token', async () => {
    mockGoogle({
      sub: 'g-1',
      email: 'tamaki@gmail.com',
      email_verified: true,
      name: 'Tamaki',
      picture: 'http://p/a.png',
    });
    oauthModel.findOrCreateUser.mockResolvedValue(147);

    const res = await request(app)
      .get('/auth/google/callback?code=abc&state=s1')
      .set('Cookie', tmpCookie('google'));

    expect(res.headers.location).toBe(`${CLIENT}/dashboard`);
    expect(verifyIdToken).toHaveBeenCalledWith(
      expect.objectContaining({ idToken: 'idt', audience: 'test-google-id' })
    );
    expect(oauthModel.findOrCreateUser).toHaveBeenCalledWith(
      'google',
      expect.objectContaining({ providerUserId: 'g-1' })
    );
    expect(sessionModel.create).toHaveBeenCalledTimes(1);
  });

  test('rejects an unverified Google email', async () => {
    mockGoogle({ sub: 'g-1', email: 'tamaki@gmail.com', email_verified: false });

    const res = await request(app)
      .get('/auth/google/callback?code=abc&state=s1')
      .set('Cookie', tmpCookie('google'));

    expect(res.headers.location).toBe(`${CLIENT}/login?error=oauth_email_unverified`);
    expect(sessionModel.create).not.toHaveBeenCalled();
  });
});