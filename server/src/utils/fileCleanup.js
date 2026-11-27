const knex = require('../db/knex');
const storage = require('./storage');

// Finishes deleting files that were removed from the library AND are on no job.
// Call it after anything that removes a job-file link. Safe to run any number of times.
// Without a userId it cleans up for everyone (used by the purge script).
async function cleanupRemovedFiles(userId) {
  try {
    const keys = await knex.transaction(async (trx) => {
      const query = trx('documents')
        .whereNotNull('deleted_at')
        .whereNotExists(
          trx('application_documents')
            .whereRaw('application_documents.document_id = documents.id')
            .select('document_id'),
        );
      if (userId !== undefined) query.where('user_id', userId);

      const rows = await query.forUpdate().select('id', 'storage_key as storageKey');
      if (rows.length > 0) await trx('documents').whereIn('id', rows.map((r) => r.id)).del();
      return rows.map((r) => r.storageKey);
    });

    // A few at a time, after the database commit.
    for (let i = 0; i < keys.length; i += 5) {
      await Promise.all(
        keys.slice(i, i + 5).map((key) =>
          storage.remove(key).catch((e) => console.error('Orphaned Cloudinary file:', key, e))),
      );
    }
  } catch (err) {
    // The change that led here is already saved, so don't report it as failed.
    console.error('File cleanup failed:', err);
  }
}

module.exports = { cleanupRemovedFiles };