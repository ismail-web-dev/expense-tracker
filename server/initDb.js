const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function initDb() {
  const host = process.env.DB_HOST;
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  console.log(`Attempting connection to MySQL at ${host}:${port}, DB: ${database}...`);

  const ssl = (process.env.DB_SSL === 'REQUIRED' || process.env.DB_SSL === 'true' || host?.includes('aivencloud.com')) ? { rejectUnauthorized: false } : undefined;

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      ssl,
      multipleStatements: true
    });
    console.log('✓ Successfully connected to MySQL server!');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying schema.sql...');
    await connection.query(sql);
    console.log('✓ Schema applied and categories seeded successfully!');

    // Verification check
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:', tables.map(r => Object.values(r)[0]));

    const [categories] = await connection.query('SELECT id, name FROM categories ORDER BY id ASC');
    console.log('Seeded categories count:', categories.length);
    console.log('Seeded categories:', categories);

  } catch (err) {
    console.error('Database initialization error:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDb();
