require('dotenv').config();

const knex = require('../db/knex');
const { purgeExpiredTrash } = require('../models/jobModel');
const { cleanupRemovedFiles } = require('../utils/fileCleanup');

purgeExpiredTrash()
  .then(async (n) => {
    console.log(`Purged ${n} expired job(s) from Trash`);
    await cleanupRemovedFiles();
  })
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => knex.destroy());