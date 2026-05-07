const fs = require('fs');
const path = require('path');
const pool = require('./pool');

// Errors we tolerate on re-run so schema.sql can contain additive ALTERs.
const TOLERATED = new Set(['ER_DUP_FIELDNAME', 'ER_DUP_KEYNAME', 'ER_CANT_DROP_FIELD_OR_KEY']);

async function seedAdminUser() {
  // Only run if admin_users is empty and ADMIN_USER / ADMIN_PASS are both set.
  const { countUsers, createUser } = require('../lib/adminAuth');
  const existing = await countUsers();
  if (existing > 0) {
    console.log(`admin_users already has ${existing} row(s) — skipping seed.`);
    return;
  }
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASS;
  const email = process.env.ADMIN_EMAIL || null;
  if (!username || !password) {
    console.log('ADMIN_USER / ADMIN_PASS not set — skipping admin seed. Set these and re-run migrate to create an admin.');
    return;
  }
  const id = await createUser({ username, password, displayName: 'Administrator', email });
  console.log(`Seeded initial admin user (id=${id}, username=${username}).`);
}

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const cleaned = sql.split('\n').filter(l => !/^\s*--/.test(l)).join('\n');
  const statements = cleaned.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);

  let okCount = 0, skipCount = 0;
  for (const stmt of statements) {
    try {
      await pool.query(stmt);
      okCount++;
      console.log('OK:', stmt.split('\n')[0].slice(0, 80));
    } catch (err) {
      if (TOLERATED.has(err.code)) {
        skipCount++;
        console.log('SKIP (' + err.code + '):', stmt.split('\n')[0].slice(0, 80));
      } else {
        throw err;
      }
    }
  }
  console.log(`\nSchema: ${okCount} applied, ${skipCount} skipped.`);

  try { await seedAdminUser(); }
  catch (err) { console.error('Admin seed failed:', err.message); }

  console.log('Migration complete.');
  process.exit(0);
})().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
