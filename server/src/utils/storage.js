// Cloudinary storage for documents. Files are "private" raw assets: no public URL works.
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

const OPTIONS = { resource_type: 'raw', type: 'private' };

// Random key, never built from the file name. Raw assets keep the extension in the id.
const newKey = (ext) => `applytrack/documents/${crypto.randomUUID()}.${ext}`;

const upload = (key, buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ ...OPTIONS, public_id: key, timeout: 45000 }, (err, result) =>
        err ? reject(err) : resolve(result))
      .end(buffer);
  });

// invalidate also clears copies cached on Cloudinary's CDN.
const remove = async (key) => {
  const { result } = await cloudinary.uploader.destroy(key, { ...OPTIONS, invalidate: true });
  if (result !== 'ok' && result !== 'not found') throw new Error(`Cloudinary delete failed: ${result}`);
};

// Fetches the file on the server, so the signed URL never reaches the browser.
async function download(key) {
  const url = cloudinary.utils.private_download_url(key, '', {
    ...OPTIONS,
    expires_at: Math.floor(Date.now() / 1000) + 60,
  });
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) {
    const reason = res.headers.get('x-cld-error') || res.statusText;
    throw Object.assign(new Error(`Cloudinary download failed: ${res.status} ${reason}`), { status: res.status });
  }
  return Buffer.from(await res.arrayBuffer());
}

module.exports = { newKey, upload, remove, download };