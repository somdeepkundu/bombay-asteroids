# Bombay Asteroids Leaderboard Backend

Open-source Flask API for storing and ranking game scores globally.

## Features

- ✅ **Simple REST API** — POST scores, GET leaderboard
- ✅ **SQLite database** — single-file, no setup needed
- ✅ **CORS enabled** — works with GitHub Pages
- ✅ **Free hosting** — deploy to Render, PythonAnywhere, or locally

## Local Development

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the server

```bash
python app.py
```

The API will be available at `http://localhost:5000`

### 3. Test the endpoints

```bash
# Submit a score
curl -X POST http://localhost:5000/api/score \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "score": 150}'

# Get leaderboard
curl http://localhost:5000/api/leaderboard

# Health check
curl http://localhost:5000/api/health
```

## Deploy to Render.com (Free)

### 1. Fork or clone this repo to GitHub

### 2. Create a Render account

Go to [render.com](https://render.com) and sign up with GitHub

### 3. Create a new Web Service

- Click **New +** → **Web Service**
- Connect your GitHub repo
- Configure:
  - **Name:** `bombay-asteroids-api`
  - **Environment:** `Python 3`
  - **Build Command:** `pip install -r requirements.txt`
  - **Start Command:** `gunicorn app:app`
  - **Plan:** Free

### 4. Deploy

Click **Create Web Service** and wait ~2 minutes.

You'll get a URL like: `https://bombay-asteroids-api.onrender.com`

## Deploy to PythonAnywhere (Free)

1. Go to [pythonanywhere.com](https://pythonanywhere.com)
2. Upload `app.py` and `requirements.txt`
3. Create a web app with Flask framework
4. Install dependencies in the console
5. Your API URL will be: `https://yourusername.pythonanywhere.com`

## API Endpoints

### POST /api/score

Submit a new score.

**Request:**
```json
{
  "name": "Player Name",
  "score": 250
}
```

**Response:**
```json
{
  "message": "Score saved!",
  "name": "Player Name",
  "score": 250
}
```

### GET /api/leaderboard

Fetch top 10 scores.

**Response:**
```json
[
  {
    "rank": 1,
    "name": "Alice",
    "score": 500,
    "timestamp": "2024-01-15 10:30:45"
  },
  {
    "rank": 2,
    "name": "Bob",
    "score": 450,
    "timestamp": "2024-01-15 09:15:22"
  }
]
```

### GET /api/health

Health check.

**Response:**
```json
{
  "status": "ok",
  "message": "Leaderboard API is running"
}
```

## Integration with Frontend

In your game's `script.js`, call these when the game ends:

```javascript
// Save score to leaderboard
async function saveToLeaderboard(playerName, finalScore) {
  const API_URL = 'https://your-api-url.com'; // Update this!
  try {
    await fetch(`${API_URL}/api/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: playerName, score: finalScore })
    });
    loadLeaderboard(); // Refresh leaderboard display
  } catch (error) {
    console.error("Error saving score:", error);
  }
}

// Load and display leaderboard
async function loadLeaderboard() {
  const API_URL = 'https://your-api-url.com'; // Update this!
  try {
    const response = await fetch(`${API_URL}/api/leaderboard`);
    const scores = await response.json();
    console.log("Leaderboard:", scores);
    // Display scores in your UI
  } catch (error) {
    console.error("Error loading leaderboard:", error);
  }
}
```

## Database

The database is stored in `leaderboard.db` (SQLite). It has one table:

```sql
CREATE TABLE scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## License

Open source — use freely!
