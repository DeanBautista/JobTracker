// Client values (dashes) -> database values (underscores).
const TYPES = {
  resume: 'resume', 'cover-letter': 'cover_letter', portfolio: 'portfolio',
  certificate: 'certificate', other: 'other',
};
const USAGES = {
  attachment: 'attachment', 'sent-resume': 'sent_resume', 'sent-cover-letter': 'sent_cover_letter',
};

const pick = (map, key) => (typeof key === 'string' && Object.hasOwn(map, key) ? map[key] : null);

const toId = (x) => {
  const n = typeof x === 'number' || typeof x === 'string' ? Number(x) : NaN;
  return Number.isSafeInteger(n) && n > 0 ? n : null;
};

// Shared by upload and attach. multipart sends booleans as text.
function validateLink(body) {
  const errors = {};
  const usedAs = pick(USAGES, body.usedAs);
  if (!usedAs) errors.usedAs = 'Invalid choice';

  let replaceFileId = null;
  if (body.replaceFileId !== undefined && body.replaceFileId !== '') {
    replaceFileId = toId(body.replaceFileId);
    if (!replaceFileId) errors.replaceFileId = 'Invalid file';
  }

  const replace = body.replace === true || body.replace === 'true';
  return { errors, values: { usedAs, replace, replaceFileId } };
}

// Type, label and usage: used by upload, attach and edit.
function validateDetails(body) {
  const { errors, values } = validateLink(body);

  const type = pick(TYPES, body.type);
  if (!type) errors.type = 'Invalid choice';

  const label = typeof body.label === 'string' ? body.label.trim() : '';
  if (!label) errors.label = 'Required';
  else if (label.length > 80) errors.label = 'Max 80 characters';

  return { errors, values: { ...values, type, label } };
}

module.exports = { validateDetails, toId };