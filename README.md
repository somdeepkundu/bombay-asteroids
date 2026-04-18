# Bombay Asteroids

A browser-based shoot'em'up game built with **vanilla HTML, CSS, and JavaScript** — no canvas, no frameworks. Dodge and destroy oncoming asteroids above Mumbai before they drain your health!

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white" />
</p>

**Live:** [somdeepkundu.github.io/bombay-asteroids](https://somdeepkundu.github.io/bombay-asteroids/)  
**GitHub Pages:** [somdeepkundu.github.io/bombay-asteroids](https://somdeepkundu.github.io/bombay-asteroids/)


---

## Story

> *17 July, 2027. No one saw them coming.*
>
> *A shower of asteroids — ancient rocks drifting through space for a billion years — found Earth today.*
> *Mumbai — the City of Dreams — is in their path.*
>
> *You are a pilot. Up there. Between them and the rocks.*
> *The city doesn't need a hero. It just needs you — right now.*

---

## Gameplay

<table>
  <tr>
    <td width="50%">
      <h3>Controls</h3>
      <table>
        <tr><td><kbd>W</kbd> / <kbd>↑</kbd></td><td>Move up</td></tr>
        <tr><td><kbd>A</kbd> / <kbd>←</kbd></td><td>Move left</td></tr>
        <tr><td><kbd>S</kbd> / <kbd>↓</kbd></td><td>Move down</td></tr>
        <tr><td><kbd>D</kbd> / <kbd>→</kbd></td><td>Move right</td></tr>
        <tr><td><kbd>SPACE</kbd></td><td>Fire (hold for auto-fire at Lv.10+)</td></tr>
        <tr><td><kbd>M</kbd> / 🔊</td><td>Toggle sound</td></tr>
        <tr><td>🕹️ Joystick</td><td>Mobile/tablet — analog movement</td></tr>
      </table>
    </td>
    <td width="50%">
      <h3>Objective</h3>
      <ul>
        <li>Pilot your spaceship to dodge incoming asteroids</li>
        <li>Shoot asteroids to destroy them and earn <strong>+10 points</strong> each</li>
        <li>Survive the countdown timer — each level has a time limit</li>
        <li>Collect powerups to restore health or gain extra time</li>
        <li>Game ends when health reaches zero or timer runs out</li>
      </ul>
    </td>
  </tr>
</table>

---

## Features

### 🎮 Core Gameplay
- **Infinite procedural difficulty** — 6+ levels generated on the fly, no ceiling. Each level increases asteroid count, speed, and introduces chaotic directional angles
- **Leaflet.js map background** — game world centered on IIT Bombay, Mumbai with parallax drift effect
- **Neon arcade theme** — synthwave-inspired CSS with glowing text, animated starfield, and pulsing HUD elements
- **Smooth movement** — delta-time based physics for consistent speed across all frame rates
- **Collision detection** — circle-based distance calculations for spaceship-asteroid and shot-asteroid interactions
- **Health & scoring system** — gradient health bar, zero-padded score, level indicator, countdown timer

### 🕹️ Controls & Input
- **Virtual analog joystick** — mobile/tablet friendly with proportional speed control (slow near center, fast at edges)
- **Shooting mechanics** — fire green plasma bolts to destroy asteroids
- **Auto-fire at Level 10+** — hold SPACE (or FIRE button) for continuous burst fire
- **Sound mute toggle** — press M or click 🔊 button

### ⚡ Powerups & Mechanics
- **Dual powerups** — health drop every 15s and time boost every 22s fall from the sky
- **Roll/Pitch locks** — from Level 4 onwards, randomly lock horizontal (roll) or vertical (pitch) movement with 5-second warning
- **Countdown timer** — per-level time pressure that shrinks as you advance; time out = game over

### 🔊 Audio
- **5 sound effects** — laser, explosion, health pickup, time boost, level-up fanfare
- **All generated with Web Audio API** — zero external audio files

### 🏆 Global Leaderboard
- **Open-source backend** — Python Flask API deployed on Google Cloud Run
- **Persistent storage** — Google Cloud Firestore (data survives forever)
- **Top 10 on game-over screen** — see where you rank globally the moment you die
- **Tracks**: player name, score, date (dd/mm), time (IST), game version

### 🎬 Experience
- **Cinematic intro** — typewriter story plays on first visit only (Mumbai, City of Dreams)
- **Persistent player name** — saved to localStorage, no re-entry needed
- **Dramatic game-over screen** — final score, level reached, global leaderboard, credits

---

## Difficulty Progression

| Level | Score to reach | Time limit | Asteroids | Horizontal drift | Speed range |
|---|---|---|---|---|---|
| 1 | 0 | 52s | 3 | Straight | 50–100 px/s |
| 2 | 50 | 48s | 5 | Straight | 65–130 px/s |
| 3 | 130 | 44s | 7 | ±60 px/s | 80–160 px/s |
| 4 | 250 | 40s | 9 | ±120 px/s | 95–195 px/s |
| 5 | 410 | 36s | 11 | ±180 px/s | 115–225 px/s |
| 6 | 620 | 32s | 13 | ±250 px/s | 135–260 px/s |
| 7+ | — | 10s floor | up to 32 | Chaotic | Increasing speed |

---

## How to Run

No build tools needed for the game frontend.

### Option 1: Open directly in browser

```bash
git clone https://github.com/somdeepkundu/bombay-asteroids.git
cd bombay-asteroids

open index.html          # macOS
start index.html         # Windows
```

### Option 2: Local server (optional)

```bash
python -m http.server 8000
# Then visit http://localhost:8000
```

### Option 3: Live on GitHub Pages

Visit **[somdeepkundu.github.io/bombay-asteroids](https://somdeepkundu.github.io/bombay-asteroids/)** — auto-deploys on every push to `main`.

---

## Leaderboard Backend

The global leaderboard is a separate open-source Flask API.

### Architecture

```
Game (GitHub Pages) ──HTTPS──> Flask API (Google Cloud Run) ──> Firestore Database
```

### Running locally

```bash
cd backend
pip install -r requirements.txt
python app.py
# API at http://localhost:5000
```

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/score` | Submit a score `{name, score, version}` |
| `GET` | `/api/leaderboard` | Top 10 scores |
| `GET` | `/api/health` | Health check |

### Deployment

Deployed on **Google Cloud Run** with **Firestore** for persistent storage. See `LEADERBOARD_SETUP.md` for full deployment guide.

---

## Project Structure

```
bombay-asteroids/
├── index.html               # Game markup
├── script.js                # Game logic + leaderboard API calls
├── style.css                # Neon arcade styles
├── README.md
├── LEADERBOARD_SETUP.md     # Backend deployment guide
├── backend/
│   ├── app.py               # Flask leaderboard API (Firestore)
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # For Google Cloud Run
│   └── README.md
├── admin/
│   └── dashboard.html       # Private analytics dashboard (local use)
└── assets/graphics/
    ├── spaceship_full.svg
    ├── asteroid1.svg
    ├── asteroid2.svg
    ├── green_projectile.svg
    └── explosion.svg
```

---

## Version History

| Version | What changed |
|---|---|
| v1.0 | Base game — movement, shooting, asteroids |
| v2.0 | Leaflet map, procedural difficulty, powerups |
| v2.1.0 | Time booster, analog joystick, auto-fire (Lv10+), roll/pitch locks |
| v2.1.1 | Web Audio sound effects (5 sounds) |
| v2.1.2 | Collision alert sound, persistent player name |
| v2.1.3 | Global leaderboard — Flask + Cloud Run backend |
| v2.1.4 | Cinematic intro story screen (first visit only) |
| v2.2.0 | Launch button mobile fix |
| v2.2.1 | Score metadata — date (dd/mm), time (IST), version |

---

## Learning Journey

Built as a hands-on extension of **"Problem Solving with Abstraction"** by [Programming 2.0](https://www.youtube.com/@programming2point0).

Started with [programming2point0/asteroids](https://github.com/programming2point0/asteroids), then added:
- Leaflet.js map integration with parallax drift
- Infinite procedural difficulty generation
- Per-level countdown timer mechanic
- Asteroid directional angles
- Health & time powerups
- Virtual analog joystick
- Web Audio API sound system
- Roll/Pitch lock mechanic
- Global leaderboard (Flask + Firestore + Cloud Run)
- Cinematic story intro

### Key concepts

| Concept | Applied to |
|---|---|
| **Abstraction** | Modular game functions (moveShip, moveAsteroids, fireShot, driftMap) |
| **Game loop** | requestAnimationFrame + delta-time physics |
| **Procedural generation** | getLevelConfig(level) scales difficulty forever |
| **Collision detection** | Euclidean distance vs. combined radii (circle-based) |
| **Physics** | Velocity-based movement with sub-pixel accuracy |
| **REST API** | Flask backend with JSON endpoints |
| **Cloud deployment** | GitHub Pages (static) + Google Cloud Run (dynamic) |
| **NoSQL database** | Firestore for persistent leaderboard storage |

---

## Credits

- **Developed by**: Somdeep Kundu · [@RuDRA Lab](https://www.rudra.iitb.ac.in/), C-TARA, IIT Bombay
- **Tutorial by**: [Programming 2.0](https://www.youtube.com/@programming2point0) (YouTube)
- **Base repo**: [programming2point0/asteroids](https://github.com/programming2point0/asteroids)
- **Graphics**: Free assets from [FreePik](https://www.freepik.com/)
  - [Asteroids](https://www.freepik.com/free-vector/asteroid-space-scene-background_5184427.htm)
  - [Spaceship](https://www.freepik.com/free-vector/futuristic-spaceship-collection-with-flat-design_2898815.htm)
  - [Shots](https://www.freepik.com/free-vector/game-handgun-blaster-shoot-light-effect_133958192.htm) by upklyak
  - [Explosion](https://www.freepik.com/free-vector/cartoon-bomb-explosion-storyboard-animation_20902933.htm) by upklyak
- **Map tiles**: [Stadia Maps](https://stadiamaps.com/)
- **Map framework**: [Leaflet.js](https://leafletjs.com/)
- **Backend**: [Flask](https://flask.palletsprojects.com/) + [Google Cloud Run](https://cloud.google.com/run) + [Firestore](https://cloud.google.com/firestore)

---

<p align="center">
  <sub>Built with curiosity, code, and neon lights ✨</sub>
</p>
