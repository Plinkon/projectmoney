const { Pool } = require('pg');
require('dotenv').config();

// Create a PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'loseyourmoney',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection cannot be established
});

// Test database connection
pool.on('connect', () => {
    console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

// Initialize database schema
const initializeDatabase = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS entries (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50),
                amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0.01 AND amount <= 1000000),
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_entries_timestamp ON entries(timestamp DESC);
            CREATE INDEX IF NOT EXISTS idx_entries_amount ON entries(amount DESC);
        `);
        console.log('✓ Database schema initialized');
    } catch (err) {
        console.error('Error initializing database schema:', err);
        throw err;
    } finally {
        client.release();
    }
};

// Database query functions
const db = {
    // Get all entries sorted by amount (descending)
    getAllEntries: async () => {
        const result = await pool.query(
            'SELECT id, name, amount, timestamp FROM entries ORDER BY amount DESC, timestamp DESC'
        );
        return result.rows;
    },

    // Add a new entry
    addEntry: async (name, amount) => {
        const result = await pool.query(
            'INSERT INTO entries (name, amount) VALUES ($1, $2) RETURNING id, name, amount, timestamp',
            [name || null, amount]
        );
        return result.rows[0];
    },

    // Get total count of entries
    getEntryCount: async () => {
        const result = await pool.query('SELECT COUNT(*) FROM entries');
        return parseInt(result.rows[0].count);
    },

    // Get entry by ID
    getEntryById: async (id) => {
        const result = await pool.query(
            'SELECT id, name, amount, timestamp FROM entries WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    // Get rank for a specific entry (by amount and timestamp)
    getRankForEntry: async (amount, timestamp) => {
        const result = await pool.query(
            `SELECT COUNT(*) + 1 AS rank
             FROM entries
             WHERE amount > $1
             OR (amount = $1 AND timestamp < $2)`,
            [amount, timestamp]
        );
        return parseInt(result.rows[0].rank);
    },

    // Close the pool
    close: async () => {
        await pool.end();
        console.log('✓ Database connection pool closed');
    }
};

module.exports = {
    db,
    initializeDatabase,
    pool
};
