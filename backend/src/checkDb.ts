import { pool } from './db';

async function checkDatabase() {
  try {
    const result = await pool.query<{ currentTime: Date }>(
      'SELECT NOW() AS "currentTime"',
    );

    console.log('Database connected:', result.rows[0].currentTime);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void checkDatabase();