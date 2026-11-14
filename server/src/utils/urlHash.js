const crypto = require('crypto');

// Normalizes a link so trivial differences don't hide a duplicate.
function hashUrl(link) {
  const url = new URL(link);
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith('utm_')) url.searchParams.delete(key);
  }
  const cleaned = url.toString().replace(/\/$/, '').toLowerCase();
  return crypto.createHash('sha256').update(cleaned).digest('hex');
}

module.exports = { hashUrl };