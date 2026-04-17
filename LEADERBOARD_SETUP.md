# 🏆 Leaderboard Setup Guide

This guide walks you through deploying the global leaderboard for Bombay Asteroids.

## Architecture

```
Game (GitHub Pages) ──HTTP──> Flask Backend ──SQLite──> Leaderboard Database
```

- **Frontend:** Hosted on GitHub Pages (already live)
- **Backend:** Python Flask API (needs deployment)
- **Database:** SQLite (included in backend)

---

## Step 1: Deploy Backend to Render.com (Easiest & Free)

### 1A. Create a Render account

1. Go to [render.com](https://render.com)
2. Click **Sign Up** and connect with GitHub
3. Authorize Render to access your GitHub account

### 1B. Deploy the backend

1. In Render dashboard, click **New +** → **Web Service**
2. Select your `bombay-asteroids` GitHub repo
3. Configure the service:
   - **Name:** `bombay-asteroids-api`
   - **Environment:** `Python 3`
   - **Region:** Choose closest to you
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Plan:** Free tier (select this!)

4. Click **Create Web Service**
5. Wait 2-3 minutes for deployment
6. You'll get a URL like: `https://bombay-asteroids-api.onrender.com`
   - **Copy this URL!** You'll need it next.

---

## Step 2: Connect Frontend to Backend

Once your API is live, update the game to point to it.

### In `script.js` (line 3):

```javascript
const LEADERBOARD_API = 'https://bombay-asteroids-api.onrender.com'; // Your Render URL here
```

Replace with your actual Render URL from Step 1.

### Commit and push:

```bash
git add script.js
git commit -m "v2.1.3: connect to leaderboard API"
git push origin main
```

---

## Step 3: Test It!

1. Go to your game: https://somdeepkundu.github.io/bombay-asteroids/
2. Enter your name and play
3. When you die, your score will be submitted to the leaderboard
4. You'll see the top 10 global scores on the game-over screen
5. Play again and compete! 🎮

---

## Troubleshooting

### "Leaderboard save failed" error?

**Cause:** API URL is wrong or backend isn't running.

**Fix:**
1. Check your Render URL is correct in `script.js`
2. Visit your Render URL directly: `https://your-url.onrender.com/api/health`
3. Should see: `{"status": "ok", "message": "Leaderboard API is running"}`
4. If not, check Render dashboard for deployment errors

### Scores not appearing?

1. Open browser console (F12) → **Console** tab
2. Play and die
3. Look for the message: `✅ Score saved to leaderboard!` or `❌ Leaderboard save failed:`
4. If failed, see above

---

## Alternative: Deploy to PythonAnywhere (Also Free)

If Render.com doesn't work:

1. Go to [pythonanywhere.com](https://pythonanywhere.com)
2. Sign up with GitHub
3. Upload `backend/app.py` and `backend/requirements.txt`
4. Create a web app → Flask → Python 3.11
5. Point WSGI to `app:app`
6. Install requirements in console: `pip install -r requirements.txt`
7. Reload the app
8. Your URL will be: `https://yourusername.pythonanywhere.com`
9. Update `LEADERBOARD_API` in `script.js` with this URL

---

## Accessing the Database

If you need to view or manage scores directly:

### On Render.com:
You can't access the database directly (managed service), but you can:
- View logs in the Render dashboard
- Query via API calls

### Locally (for testing):
```bash
cd backend
python3 << 'EOF'
import sqlite3
conn = sqlite3.connect('leaderboard.db')
c = conn.cursor()
c.execute("SELECT name, score FROM scores ORDER BY score DESC LIMIT 10")
for row in c.fetchall():
    print(f"{row[0]}: {row[1]} pts")
conn.close()
EOF
```

---

## API Reference

Your backend provides 3 endpoints:

### `POST /api/score`
Submit a score
```json
{ "name": "Alice", "score": 250 }
```

### `GET /api/leaderboard`
Fetch top 10 scores
```json
[
  { "rank": 1, "name": "Alice", "score": 500, "timestamp": "2024-01-15 10:30:45" },
  { "rank": 2, "name": "Bob", "score": 450, "timestamp": "2024-01-15 09:15:22" }
]
```

### `GET /api/health`
Health check
```json
{ "status": "ok", "message": "Leaderboard API is running" }
```

---

## What's Included

```
backend/
├── app.py              # Flask API server
├── requirements.txt    # Python dependencies
└── README.md          # Backend documentation

In root:
├── script.js          # Updated with leaderboard functions
├── style.css          # Added leaderboard styling
└── LEADERBOARD_SETUP.md (this file)
```

---

## Next Steps (Optional)

Future enhancements:
- [ ] Anti-cheat validation (verify physics scores)
- [ ] Player avatars / colors
- [ ] Seasonal leaderboards
- [ ] Personal best tracking
- [ ] Share score on social media

---

**Questions?** Check `backend/README.md` or open an issue on GitHub!

🚀 **Now deploy and let your players compete globally!**
