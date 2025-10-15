const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
require('dotenv').config();

const { db, initializeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - required for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// Security Middleware - Comprehensive Helmet Configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true
}));

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGIN || '*'
        : '*',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser with size limits to prevent DOS attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Rate limiting for API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limiting for POST requests
const postLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 POST requests per hour
    message: 'Too many submissions from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Disable X-Powered-By header
app.disable('x-powered-by');

// Prevent directory listing and file traversal
app.use(express.static(__dirname, {
    dotfiles: 'deny',
    index: false,
    redirect: false
}));

// Security headers middleware
app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Prevent MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Enable XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Referrer policy
    res.setHeader('Referrer-Policy', 'no-referrer');
    // Feature policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
});

// Seed initial data if database is empty
async function seedInitialData() {
    try {
        const count = await db.getEntryCount();
        if (count === 0) {
            console.log('Seeding initial data...');
            const initialEntries = [
                { name: 'Anonymous', amount: 1337.50 },
                { name: 'John Doe', amount: 999.99 },
                { name: 'Jane Smith', amount: 750.00 },
                { name: 'Bob Wilson', amount: 500.25 },
                { name: 'Alice Brown', amount: 420.69 }
            ];
            for (const entry of initialEntries) {
                await db.addEntry(entry.name, entry.amount);
            }
            console.log('✓ Initial data seeded');
        }
    } catch (error) {
        console.error('Error seeding initial data:', error);
    }
}

// Get all entries
app.get('/api/entries', async (req, res) => {
    try {
        const entries = await db.getAllEntries();
        // Format entries for frontend
        const formattedEntries = entries.map((entry, index) => ({
            id: entry.id,
            name: entry.name || 'Anonymous',
            amount: parseFloat(entry.amount),
            date: entry.timestamp,
            rank: index + 1
        }));
        res.json(formattedEntries);
    } catch (error) {
        console.error('Error reading entries:', error);
        res.status(500).json({ error: 'Failed to load entries' });
    }
});

// Validation middleware for entries
const validateEntry = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Name must be between 1 and 50 characters')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Name can only contain letters, numbers, spaces, hyphens, and underscores')
        .escape(),
    body('amount')
        .isFloat({ min: 0.01, max: 1000000 })
        .withMessage('Amount must be between $0.01 and $1,000,000')
        .toFloat()
];

// Add new entry (no payment required - honor system)
app.post('/api/entries', postLimiter, validateEntry, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, amount } = req.body;

        // Add entry to database
        const newEntry = await db.addEntry(name || 'Anonymous', parseFloat(amount));

        // Calculate rank for the new entry
        const rank = await db.getRankForEntry(newEntry.amount, newEntry.timestamp);

        // Format response
        const response = {
            id: newEntry.id,
            name: newEntry.name || 'Anonymous',
            amount: parseFloat(newEntry.amount),
            date: newEntry.timestamp,
            rank: rank
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error adding entry:', error);
        res.status(500).json({ error: 'Failed to add entry' });
    }
});

// Get total amount lost
app.get('/api/stats', async (req, res) => {
    try {
        const entries = await db.getAllEntries();

        const totalLost = entries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
        const totalEntries = entries.length;

        res.json({
            totalLost,
            totalEntries,
            averageLoss: totalEntries > 0 ? totalLost / totalEntries : 0
        });
    } catch (error) {
        console.error('Error reading stats:', error);
        res.status(500).json({ error: 'Failed to load stats' });
    }
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database schema
        await initializeDatabase();

        // Seed initial data if needed
        await seedInitialData();

        // Start server
        app.listen(PORT, () => {
            console.log(`✓ Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to initialize server:', err);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await db.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await db.close();
    process.exit(0);
});

startServer();
