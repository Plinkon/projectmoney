# Lose Your Money

A satirical website where users can voluntarily "lose" money to the digital void. Built with vanilla JavaScript, Node.js, and Express.

## Features

- **Interactive Floating Money**: Hover over floating money emojis to see who contributed and how much
- **Real-time Leaderboard**: See who has lost the most money
- **Interactive Void Browser**: Explore the digital void with zoom/pan controls to view all lost money
- **Congratulations Popup**: Celebrate each loss with detailed info and rank
- **PostgreSQL Database**: Persistent, scalable data storage with connection pooling
- **Professional UI/UX**: Modern dark theme with glass morphism and smooth animations
- **Responsive Design**: Works on desktop and mobile devices
- **Enterprise Security**: 11+ layers of security protection

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- PostgreSQL (v12 or higher)

### Database Setup

1. Install PostgreSQL:
   - **macOS**: `brew install postgresql` or download from [postgresql.org](https://www.postgresql.org/)
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`
   - **Windows**: Download installer from [postgresql.org](https://www.postgresql.org/)

2. Start PostgreSQL service:
   - **macOS**: `brew services start postgresql`
   - **Linux**: `sudo systemctl start postgresql`
   - **Windows**: Service starts automatically

3. Create the database:
```bash
# Access PostgreSQL shell
psql -U postgres

# Create database
CREATE DATABASE loseyourmoney;

# Exit shell
\q
```

### Application Setup

1. Clone the repository (if not already done):
```bash
git clone <your-repo-url>
cd loseyourmoney
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your database credentials
# Example:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=loseyourmoney
# DB_USER=postgres
# DB_PASSWORD=your_password
```

4. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

The application will automatically:
- Create the database schema (tables and indexes)
- Seed initial demo data if the database is empty
- Start the Express server

### How It Works

This is a **satirical website** that works on the honor system:
- Users enter the amount they "lose" to the void
- No actual payment processing (to avoid age verification requirements)
- All entries are tracked and displayed on the leaderboard
- Rate limiting prevents spam (20 entries per hour per IP)
- Input validation ensures data integrity

## Deployment

### Deploy to Railway (Recommended)

Railway provides free PostgreSQL hosting and easy deployment:

1. Create account at [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Add PostgreSQL service: Click "New" → "Database" → "Add PostgreSQL"
4. Set environment variables in your web service:
   - Link to the PostgreSQL database
   - Railway will auto-populate `DATABASE_URL`
5. Deploy automatically on git push

### Deploy to Render

Render provides free PostgreSQL and web hosting:

1. Create account at [Render.com](https://render.com)
2. Create a new PostgreSQL database
3. Create a new Web Service:
   - Connect your GitHub repository
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variables:
   - Copy database credentials from your PostgreSQL instance
   - Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

### Deploy to Heroku

1. Create a Heroku account and install Heroku CLI
2. Login to Heroku:
```bash
heroku login
```

3. Create a new Heroku app:
```bash
heroku create your-app-name
```

4. Add PostgreSQL addon:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

5. Deploy:
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

Note: You may need to set environment variables from the PostgreSQL connection string provided by Heroku.

## Project Structure

```
loseyourmoney/
├── index.html          # Main HTML file with all page structures
├── styles.css          # All styling (glass morphism, dark theme)
├── script.js           # Frontend JavaScript (void browser, animations)
├── server.js           # Backend Express server
├── db.js               # PostgreSQL database configuration
├── schema.sql          # Database schema definition
├── package.json        # Node.js dependencies
├── .env                # Environment variables (create from .env.example)
├── .env.example        # Example environment configuration
├── .gitignore          # Git ignore file
├── SECURITY.md         # Security documentation
└── README.md           # This file
```

## API Endpoints

- `GET /api/entries` - Get all entries sorted by amount (descending)
  - Returns: Array of entries with id, name, amount, date, rank
- `POST /api/entries` - Add new entry (body: `{name, amount}`)
  - Validates input and adds to PostgreSQL database
  - Returns: New entry with calculated rank
- `GET /api/stats` - Get statistics
  - Returns: totalLost, totalEntries, averageLoss

## Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5 Canvas (for void), CSS3
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with connection pooling (pg library)
- **Security**: Helmet, express-rate-limit, express-validator, xss-clean, hpp
- **Styling**: Custom CSS with glass morphism, backdrop filters, animations

## Security

This application implements enterprise-grade security with 11+ protection layers:

**Key Security Features:**
- ✅ **Helmet.js**: 15+ security headers (CSP, HSTS, XSS, frame protection, etc.)
- ✅ **Triple Rate Limiting**: API (100/15min), POST (20/hr), Button cooldown (5s)
- ✅ **Input Validation**: express-validator with strict rules and sanitization
- ✅ **XSS Protection**: xss-clean middleware prevents cross-site scripting
- ✅ **SQL Injection Prevention**: Parameterized queries with pg library
- ✅ **HPP Protection**: Prevents HTTP parameter pollution
- ✅ **CORS Configuration**: Configurable origin restrictions
- ✅ **Request Size Limits**: 10KB max payload prevents DOS attacks
- ✅ **File System Protection**: Prevents directory traversal
- ✅ **Graceful Shutdown**: Proper database connection cleanup
- ✅ **Environment Variables**: Sensitive config stored in .env

See [SECURITY.md](SECURITY.md) for detailed security documentation.

## License

MIT
