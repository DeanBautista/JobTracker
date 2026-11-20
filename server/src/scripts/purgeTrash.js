const knex = require('../db/knex');
const { purgeExpiredTrash } = require('../models/jobModel');

purgeExpiredTrash()
  .then((n) => console.log(`Purged ${n} expired job(s) from Trash`))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => knex.destroy());