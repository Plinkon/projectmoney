# Quick Start Guide

## 🚀 Get Your Site Running in 5 Minutes

### Step 1: Install Node.js
If you don't have Node.js installed:
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (left button)
3. Run the installer
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install Dependencies
Open Terminal (Mac) or Command Prompt (Windows) and run:
```bash
cd "/Users/jakelewy/Coding Projects/HTML/loseyourmoney"
npm install
```

This will install all required packages.

### Step 3: Start the Server
```bash
npm start
```

You should see:
```
Server running on http://localhost:3000
```

### Step 4: Open Your Browser
Go to: `http://localhost:3000`

## 🎉 That's It!

Your website is now running locally!

## 🧪 Test It Out

1. Click "Lose Your Money"
2. Enter an amount (any amount from $0.01 to $1,000,000)
3. Optionally add your name
4. Click "Lose It!"
5. Watch the money fly into the void!
6. Check the leaderboard
7. **Hover over the floating 💸 emojis** to see info about each contribution

**Note:** This is a satirical website that works on the honor system - no actual payments are processed to avoid age verification requirements!

## 🌐 Deploy It Online

Want to make it public? Check out [README.md](README.md) for deployment instructions to:
- Railway (Recommended - Free & Easy)
- Render
- Heroku

All these platforms have free tiers perfect for this project!

## ❓ Troubleshooting

### "npm: command not found"
- Node.js isn't installed. Go back to Step 1.

### "Port 3000 already in use"
- Something else is using port 3000
- Either stop that app or change the port in `.env`:
  ```
  PORT=3001
  ```

### Tooltips not showing when hovering over money
- Make sure you're hovering directly over the 💸 emoji
- Try refreshing the page
- Check browser console for errors (F12 key)

### Entries not saving
- Make sure the server is running (`npm start`)
- Check browser console for errors (F12 key)
- Verify you're not hitting rate limits (20 entries/hour)

## 🔒 Is It Secure?

Yes! The application has multiple security layers:

**Security Features:**
- ✅ Rate limiting prevents spam (20 entries/hour per IP)
- ✅ Input validation prevents injection attacks
- ✅ XSS protection enabled
- ✅ Name sanitization (no HTML or scripts)
- ✅ Amount validation ($0.01 - $1,000,000)
- ✅ Helmet security headers protect against common attacks
- ✅ No SQL injection possible (JSON storage)

**Note:** This is a satirical/demonstration website. No real payments are processed.

## 📝 Need Help?

Check out:
- [README.md](README.md) - Full documentation
- [IMPROVEMENTS_SUMMARY.md](IMPROVEMENTS_SUMMARY.md) - What was built
