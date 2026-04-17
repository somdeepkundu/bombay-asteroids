"""
Bombay Asteroids Leaderboard API
Backend server for global leaderboard storage
Open-source, runs on Flask + SQLite
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests from GitHub Pages

DB_FILE = 'leaderboard.db'

def init_db():
    """Initialize SQLite database with leaderboard table."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            score INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Initialize DB on startup
init_db()

@app.route('/api/score', methods=['POST', 'OPTIONS'])
def submit_score():
    """Submit a new score to the leaderboard."""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        score = data.get('score')

        # Validation
        if not name or name == '':
            return jsonify({"error": "Name required"}), 400
        if score is None or not isinstance(score, (int, float)):
            return jsonify({"error": "Invalid score"}), 400
        if score < 0:
            return jsonify({"error": "Score must be >= 0"}), 400

        # Cap name length to prevent spam
        name = name[:30]
        score = int(score)

        # Save to database
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute(
            "INSERT INTO scores (name, score) VALUES (?, ?)",
            (name, score)
        )
        conn.commit()
        conn.close()

        return jsonify({
            "message": "Score saved!",
            "name": name,
            "score": score
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Fetch top 10 scores from the leaderboard."""
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()

        # Get top 10 scores, ordered highest to lowest
        c.execute("""
            SELECT name, score, timestamp
            FROM scores
            ORDER BY score DESC
            LIMIT 10
        """)

        rows = c.fetchall()
        leaderboard = [
            {
                "rank": idx + 1,
                "name": row[0],
                "score": row[1],
                "timestamp": row[2]
            }
            for idx, row in enumerate(rows)
        ]
        conn.close()

        return jsonify(leaderboard), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

ADMIN_KEY = 'sRxMAdjR7-n9Doq1YFkppw'

@app.route('/api/admin', methods=['GET'])
def admin_scores():
    """Private admin endpoint — returns ALL scores. Key protected."""
    key = request.args.get('key', '')
    if key != ADMIN_KEY:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("""
            SELECT id, name, score, timestamp
            FROM scores
            ORDER BY score DESC
        """)
        rows = c.fetchall()
        total = len(rows)
        scores = [
            {
                "rank": idx + 1,
                "id": row[0],
                "name": row[1],
                "score": row[2],
                "timestamp": row[3]
            }
            for idx, row in enumerate(rows)
        ]
        conn.close()
        return jsonify({"total": total, "scores": scores}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({"status": "ok", "message": "Leaderboard API is running"}), 200

@app.route('/', methods=['GET'])
def index():
    """Root endpoint."""
    return jsonify({
        "name": "Bombay Asteroids Leaderboard API",
        "version": "1.0",
        "endpoints": {
            "POST /api/score": "Submit a score",
            "GET /api/leaderboard": "Get top 10 scores",
            "GET /api/health": "Health check"
        }
    }), 200

if __name__ == '__main__':
    # For local testing
    app.run(debug=True, host='0.0.0.0', port=5000)
