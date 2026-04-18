# Bombay Asteroids

A browser-based shoot'em'up built with **vanilla HTML, CSS, and JavaScript** — no canvas, no game engine. Pilot your spaceship above Mumbai and destroy incoming asteroids before they drain your hull.

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

<p align="center">
  <strong>🎮 Play now → <a href="https://somdeepkundu.github.io/bombay-asteroids/">somdeepkundu.github.io/bombay-asteroids</a></strong><br/>
  <strong>🌐 Also live on → <a href="https://bombay-asteroids.streamlit.app/">bombay-asteroids.streamlit.app</a></strong>
</p>

---

## Story

> *17 July, 2027. No one saw them coming.*
>
> *A shower of asteroids — ancient rocks drifting through space for a billion years — found Earth today.*
>
> *Mumbai — the City of Dreams — is in their path.*
> *Twelve million people. The fishermen of Versova. The dancers of Dharavi.*
> *Children chasing kites on Marine Drive.*
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
        <tr><td><kbd>W A S D</kbd> / Arrow keys</td><td>Move ship</td></tr>
        <tr><td><kbd>SPACE</kbd></td><td>Fire · Hold for auto-fire at Lv 10+</td></tr>
        <tr><td><kbd>P</kbd> / <kbd>Esc</kbd></td><td>Pause (one use per game)</td></tr>
        <tr><td><kbd>M</kbd> / 🔊</td><td>Toggle sound</td></tr>
        <tr><td>🕹️ Joystick</td><td>Mobile — analog movement</td></tr>
        <tr><td>🔴 FIRE button</td><td>Mobile — shoot</td></tr>
      </table>
    </td>
    <td width="50%">
      <h3>Objective</h3>
      <ul>
        <li>Destroy asteroids before they breach your hull</li>
        <li>Large asteroids split into 2 fast smalls from <strong>Level 8+</strong></li>
        <li>Survive the per-level countdown timer</li>
        <li>Collect powerups: health, time boost, shield</li>
        <li>Game ends when health hits zero or timer runs out</li>
        <li>Score posted to the global leaderboard on death</li>
      </ul>
    </td>
  </tr>
</table>

---

## Features

### 🎮 Core Gameplay
- **Infinite procedural difficulty** — no level ceiling; each level increases asteroid count, speed, and chaos
- **Leaflet.js map background** — world centered on Mumbai / IIT Bombay with real-time parallax drift
- **Delta-time physics** — smooth movement at any frame rate
- **Circle collision detection** — distance-based for ship↔asteroid and shot↔asteroid
- **Splitting asteroids** — from Level 8 onwards, large rocks (50 px) shatter into 2 fast smalls (28 px) · +10 pts per split, +15 pts per small destroyed
- **Continuous asteroid replenishment** — game loop maintains target count every tick, no drought at high levels
- **Roll / Pitch locks** — from Level 4, a random axis locks for 6 s with a 5 s warning countdown

### ⚡ Powerups
| Powerup | Frequency | Effect |
|---|---|---|
| ❤️ Health | Every 15 s | Restore 40% hull |
| ⏱ Time boost | Every 22 s | +12 s on the timer |
| 🛡️ Shield | Every 35 s | 5 s of full invincibility (blue glow) |

### 🕹️ Controls & UX
- **Virtual analog joystick** — proportional speed from center to edge
- **One-use pause** — pause button goes grey after use; P / Esc triggers it
- **Auto-fire** — hold SPACE/FIRE from Level 10+
- **Compact level-up banner** — slides in at the top, gone in 1.4 s, never blocks the field

### 🔊 Audio (Web Audio API, zero external files)
Laser · Explosion · Health pickup · Time boost · Level-up fanfare

### 🏆 Global Leaderboard
- **Flask API** on **Google Cloud Run** → **Firestore** (permanent storage)
- Every score saves: name, score, level reached, date (dd/mm), time (IST), game version
- Top 10 displayed on the game-over screen seconds after you die
- **Profanity filter** — bad names replaced with `*******` on the public board

### 🎬 Experience
- **Cinematic intro** — typewriter story plays on first visit only; skippable with Enter / Space
- **Personal best** — gold badge on game-over screen when you beat your previous best; stored in localStorage
- **Share score** — WhatsApp link or native share (Instagram / clipboard) from the game-over screen
- **Persistent player name** — remembered across sessions

### 📱 PWA / Installable
- `manifest.json` + service worker (`sw.js`) — install as a home-screen app on Android/iOS
- Offline-capable for all static assets; API calls use network-first

---

## Difficulty Progression

| Level | Asteroids | Time limit | Horizontal drift | Speed range |
|---|---|---|---|---|
| 1 | 5 | 52 s | Straight | 65–128 px/s |
| 2 | 7 | 48 s | Slight | 80–156 px/s |
| 3 | 9 | 44 s | ±65 px/s | 95–184 px/s |
| 4 🔒 | 11 | 40 s | ±130 px/s | 110–212 px/s |
| 5 | 13 | 36 s | ±195 px/s | 125–240 px/s |
| 8+ 💥 | 16+ | ≥ 20 s | Chaotic | Uncapped |
| ∞ | 16 cap | 10 s floor | Chaotic | Increasing |

> 🔒 Roll/Pitch lock activates from Level 4 · 💥 Asteroid splitting unlocks from Level 8

---

## Admin Analytics Dashboard

`admin/dashboard.html` — open locally in browser, password-protected.

| Section | What it shows |
|---|---|
| **Stat cards** | Total plays · Unique players · Today active · Top score · Avg score · Hardest level |
| **Top 15 bar chart** | Best players by score (gold / silver / bronze tint) |
| **Death Heatmap** | Deaths per level, color-coded green → yellow → red |
| **Daily Active Players** | Unique player names per calendar day |
| **All Scores table** | Full sortable leaderboard — click any column header to sort |

---

## How to Run

No build tools needed.

### Play instantly
```
https://somdeepkundu.github.io/bombay-asteroids/
```

### Run locally
```bash
git clone https://github.com/somdeepkundu/bombay-asteroids.git
cd bombay-asteroids
python -m http.server 8000
# Visit http://localhost:8000
```

### Backend (leaderboard API)
```bash
cd backend
pip install -r requirements.txt
python app.py          # API at http://localhost:5000
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/score` | — | Submit score `{name, score, level, version}` |
| `GET` | `/api/leaderboard` | — | Top 10 scores (public) |
| `GET` | `/api/admin?key=…` | Key | All scores with full metadata |
| `GET` | `/api/health` | — | Health check |
| `GET` | `/api/debug` | — | Firestore connectivity test |

---

## Project Structure

```
bombay-asteroids/
├── index.html               # Game HTML + PWA meta tags
├── script.js                # Game logic, leaderboard, audio (v2.2.6)
├── style.css                # Neon arcade styles, mobile layout
├── manifest.json            # PWA manifest
├── sw.js                    # Service worker (offline cache)
├── dashboard.html           # Public-facing dashboard alias
├── README.md
├── LEADERBOARD_SETUP.md
├── backend/
│   ├── app.py               # Flask API (Firestore) — saves level, IST time
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
├── admin/
│   └── dashboard.html       # Analytics dashboard v1.4 (local, key-protected)
└── assets/graphics/
    ├── spaceship_full.svg
    ├── asteroid1.svg / asteroid2.svg
    ├── green_projectile.svg
    └── explosion.svg
```

---

## Version History

| Version | What changed |
|---|---|
| v1.0 | Base game — movement, shooting, asteroids |
| v2.0 | Leaflet map, procedural difficulty, powerups |
| v2.1.0 | Time booster, analog joystick, auto-fire (Lv 10+), roll/pitch locks |
| v2.1.1 | Web Audio API sound effects (5 sounds, zero files) |
| v2.1.2 | Collision alert sound, persistent player name |
| v2.1.3 | Global leaderboard — Flask + Cloud Run + Firestore |
| v2.1.4 | Cinematic intro story (first visit only, typewriter effect) |
| v2.2.0 | Mobile layout overhaul — fixed joystick, FIRE, mute positions |
| v2.2.1 | Score metadata — date (dd/mm), time (IST), version |
| v2.2.2 | Profanity filter · Admin dashboard · Firestore migration |
| v2.2.3 | Personal best · Shield powerup · Splitting asteroids · WhatsApp/Instagram share · One-use pause · PWA · Level transition |
| v2.2.4 | Fix asteroid drought after Lv 11 · Split gated to Lv 8 · Stronger shield glow · Compact level banner |
| v2.2.5 | Analytics — death heatmap & daily active players · Level tracked per score |
| v2.2.6 | Shield glow performance fix (2 shadow layers, no per-frame stutter) |

---

## Learning Journey

Built as a hands-on extension of **"Problem Solving with Abstraction"** by [Programming 2.0](https://www.youtube.com/@programming2point0).

Started from [programming2point0/asteroids](https://github.com/programming2point0/asteroids), then extended with:

| Concept | Applied to |
|---|---|
| **Abstraction** | Modular game functions — `moveShip`, `spawnAsteroid`, `splitAsteroid`, `updateShieldGlow` |
| **Game loop** | `requestAnimationFrame` + delta-time physics |
| **Procedural generation** | `getLevelConfig(lvl)` scales difficulty infinitely |
| **Collision detection** | Euclidean distance vs. combined radii |
| **Web Audio API** | Procedural sound effects, zero audio files |
| **REST API** | Flask backend with JSON endpoints |
| **Cloud deployment** | GitHub Pages (static) + Google Cloud Run (dynamic API) |
| **NoSQL database** | Firestore — stores level, date, time, version per score |
| **PWA** | Service worker + manifest for installable offline app |
| **Analytics** | Death heatmap, daily active player charts in admin dashboard |

---

## Credits

- **Developed by**: Somdeep Kundu · [@RuDRA Lab](https://www.rudra.iitb.ac.in/), C-TARA, IIT Bombay
- **Tutorial by**: [Programming 2.0](https://www.youtube.com/@programming2point0) (YouTube)
- **Base repo**: [programming2point0/asteroids](https://github.com/programming2point0/asteroids)
- **Graphics**: [FreePik](https://www.freepik.com/) — asteroids, spaceship, projectile, explosion
- **Map tiles**: [CARTO](https://carto.com/) dark tiles via [Leaflet.js](https://leafletjs.com/)
- **Backend**: [Flask](https://flask.palletsprojects.com/) + [Google Cloud Run](https://cloud.google.com/run) + [Firestore](https://cloud.google.com/firestore)

---

<p align="center">
  <sub>Built with curiosity, code, and neon lights ✨ · Mumbai, City of Dreams</sub>
</p>
