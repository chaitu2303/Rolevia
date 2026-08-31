const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  const connectionString = process.env.DIRECT_URL;
  console.log('Testing connection to:', connectionString.replace(/:[^:@]+@/, ':***@'));
  
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 10000 // 10s timeout
  });

  try {
    await client.connect();
    console.log('Successfully connected to database!');
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('Connection error details:', err.message);
    if (err.code) console.error('Error code:', err.code);
  }
}

testConnection();
