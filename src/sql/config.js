const { Pool } = require('pg');
const path = require('path');

// You can store these in environment variables for production
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'main',
    password: process.env.DB_PASSWORD || 'yourpassword',
    port: process.env.DB_PORT || 5432,
    max: 20,            // Max number of connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL error', err);
});

// Query function
async function query(text, params) {
    const client = await pool.connect();
    try {
        const res = await client.query(text, params);
        return res.rows;
    } catch (err) {
        console.error('Query error', err);
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    query,
    pool,
};
