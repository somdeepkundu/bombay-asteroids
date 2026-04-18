"""
Bombay Asteroids Leaderboard API
Backend server for global leaderboard storage
Uses Google Cloud Firestore for persistent storage
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import firestore
from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))

app = Flask(__name__)
CORS(app)

ADMIN_KEY = 'sRxMAdjR7-n9Doq1YFkppw'

# ── Profanity filter ──────────────────────────────────
BAD_WORDS = [
    'madarchod','maderchod','bhadwa','bhadwe','chutiya','chutiye',
    'bhenchod','benchod','gaandu','gandu','loda','lund','randi',
    'harami','behenchod','bhosdi','bsdk','mc','bc','fuck','shit',
    'bitch','asshole','bastard','cunt','dick','pussy','nigger',
    'nigga','whore','slut','motherfucker','fucker','fag','retard',
]

def clean_name(name):
    """Replace name with ******* if it contains a bad word."""
    lower = name.lower().replace(' ', '')
    for word in BAD_WORDS:
        if word in lower:
            return '*******'
    return name

# Firestore client — explicit project ID for Cloud Run
db = firestore.Client(project='bombay-asteroids')
COLLECTION = 'scores'

@app.route('/api/score', methods=['POST', 'OPTIONS'])
def submit_score():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json()
        name  = data.get('name', '').strip()
        score = data.get('score')

        if not name:
            return jsonify({"error": "Name required"}), 400
        if score is None or not isinstance(score, (int, float)):
            return jsonify({"error": "Invalid score"}), 400
        if score < 0:
            return jsonify({"error": "Score must be >= 0"}), 400

        name  = name[:30]
        score = int(score)

        version = data.get('version', '?')
        level   = int(data.get('level', 0))
        now     = datetime.now(IST)

        db.collection(COLLECTION).add({
            'name':      name,
            'score':     score,
            'version':   version,
            'level':     level,
            'date':      now.strftime('%d/%m'),
            'time':      now.strftime('%H:%M IST'),
            'timestamp': now.strftime('%Y-%m-%d %H:%M IST')
        })

        return jsonify({"message": "Score saved!", "name": name, "score": score}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        docs   = db.collection(COLLECTION).stream()
        scores = sorted(
            [d.to_dict() for d in docs],
            key=lambda x: x.get('score', 0),
            reverse=True
        )[:10]
        leaderboard = [
            {
                "rank":      i + 1,
                "name":      clean_name(s.get('name', '')),
                "score":     s.get('score'),
                "date":      s.get('date', ''),
                "time":      s.get('time', ''),
                "version":   s.get('version', ''),
                "timestamp": s.get('timestamp')
            }
            for i, s in enumerate(scores)
        ]
        return jsonify(leaderboard), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/admin', methods=['GET'])
def admin_scores():
    key = request.args.get('key', '')
    if key != ADMIN_KEY:
        return jsonify({"error": "Unauthorized"}), 401
    try:
        docs = db.collection(COLLECTION).stream()
        scores = sorted([d.to_dict() for d in docs], key=lambda x: x.get('score', 0), reverse=True)
        result = [
            {
                "rank":      i + 1,
                "name":      clean_name(s.get('name', '')),
                "score":     s.get('score'),
                "level":     s.get('level', 0),
                "date":      s.get('date', ''),
                "time":      s.get('time', ''),
                "version":   s.get('version', ''),
                "timestamp": s.get('timestamp')
            }
            for i, s in enumerate(scores)
        ]
        return jsonify({"total": len(result), "scores": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/debug', methods=['GET'])
def debug():
    """Debug endpoint to test Firestore connection."""
    try:
        db.collection(COLLECTION).limit(1).stream()
        return jsonify({"firestore": "connected", "project": "bombay-asteroids"}), 200
    except Exception as e:
        return jsonify({"firestore": "error", "detail": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Leaderboard API is running (Firestore)"}), 200


@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "name": "Bombay Asteroids Leaderboard API",
        "version": "2.0",
        "storage": "Google Cloud Firestore",
        "endpoints": {
            "POST /api/score":     "Submit a score",
            "GET /api/leaderboard":"Get top 10 scores",
            "GET /api/admin":      "All scores (key required)",
            "GET /api/health":     "Health check"
        }
    }), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
