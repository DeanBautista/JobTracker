// Adds "certificate" to documents.type. New values go at the end of an ENUM.
exports.up = (knex) =>
  knex.raw(`ALTER TABLE documents
    MODIFY type ENUM('resume','cover_letter','portfolio','other','certificate') NOT NULL`);

exports.down = async (knex) => {
  await knex('documents').where('type', 'certificate').update({ type: 'other' });
  await knex.raw(`ALTER TABLE documents
    MODIFY type ENUM('resume','cover_letter','portfolio','other') NOT NULL`);
};