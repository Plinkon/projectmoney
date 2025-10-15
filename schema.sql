-- Lose Your Money Database Schema

-- Create the entries table
CREATE TABLE IF NOT EXISTS entries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0.01 AND amount <= 1000000),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on timestamp for faster ordering
CREATE INDEX IF NOT EXISTS idx_entries_timestamp ON entries(timestamp DESC);

-- Create index on amount for faster queries
CREATE INDEX IF NOT EXISTS idx_entries_amount ON entries(amount DESC);
