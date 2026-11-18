const knex = require('../db/knex');
const { resetDemoData } = require('../db/demoSeed');

(async () => {
  try {
    const user = await knex('users')
      .where({ email: process.env.DEMO_EMAIL || 'demo.account@gmail.com', is_demo: 1 })
      .first('id');
    if (!user) throw new Error('Demo user not found');
    await resetDemoData(user.id);
    console.log('Demo data reset.');
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await knex.destroy();
  }
})();