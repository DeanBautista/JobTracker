// dueAt must carry a zone (Z or +08:00) so the server never guesses the user's timezone.
const ISO_WITH_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

// partial = true for PATCH: only validate fields that were sent.
function validateReminder(body, { partial = false } = {}) {
  const errors = {};
  const values = {};

  if (!partial || body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title || title.length > 160) errors.title = 'Enter a title up to 160 characters';
    else values.title = title;
  }

  if (!partial || body.dueAt !== undefined) {
    const t = typeof body.dueAt === 'string' && ISO_WITH_ZONE.test(body.dueAt) ? new Date(body.dueAt) : null;
    if (!t || Number.isNaN(t.getTime())) errors.dueAt = 'Enter a valid due date and time';
    else values.due_at = t.toISOString().slice(0, 19).replace('T', ' '); // UTC for MySQL
  }

  if (body.note !== undefined) {
    if (body.note !== null && typeof body.note !== 'string') errors.note = 'Note must be text';
    else {
      const note = (body.note ?? '').trim();
      if (note.length > 1000) errors.note = 'Enter a note up to 1000 characters';
      else values.note = note || null;
    }
  }

  return { errors, values };
}

module.exports = { validateReminder };