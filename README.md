# Bombay Asteroids

A browser-based shoot'em'up game built with **vanilla HTML, CSS, and JavaScript** — no canvas, no frameworks, no external dependencies. Dodge and destroy oncoming asteroids above Mumbai before they drain your health!

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" />
</p>

**Live:** [bombay-asteroids.streamlit.app](https://bombay-asteroids.streamlit.app/)  
**GitHub Pages:** [somdeepkundu.github.io/bombay-asteroids](https://somdeepkundu.github.io/bombay-asteroids/)

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
        <li>Game ends when health reaches zero or timer runs out</li>
      </ul>
    </td>
  </tr>
</table>

---

## Features

- **Infinite procedural difficulty** — 6+ levels generated on the fly, with no ceiling. Each level increases asteroid count, speed, and introduces chaotic directional angles
- **Leaflet.js map background** — game world centered on IIT Bombay, Mumbai with parallax drift effect (simulates forward flight)
- **Neon arcade theme** — synthwave-inspired CSS with glowing text, animated starfield, and pulsing HUD elements
- **Smooth movement** — delta-time based physics for consistent speed across all frame rates
- **Virtual analog joystick** — mobile/tablet friendly with proportional speed control (slow near center, fast at edges)
- **Shooting mechanics** — fire green plasma bolts to destroy asteroids before they hit you
- **Auto-fire at Level 10+** — hold SPACE (or FIRE button) for continuous burst fire
- **Collision detection** — circle-based distance calculations for spaceship-asteroid and shot-asteroid interactions
- **Health & scoring system** — gradient health bar, zero-padded score, level indicator, and countdown timer
- **Countdown timer** — per-level time pressure that shrinks as you advance; time out = game over
- **Dual powerups** — health (every 15s) and time boost (every 22s) that fall from the sky
- **Roll/Pitch locks** — from Level 4 onwards, randomly lock horizontal (roll) or vertical (pitch) movement with 5-second warning
- **Sound effects** — retro arcade audio (laser, explosion, powerup chimes, level-up fanfare) generated with Web Audio API
- **Sound mute toggle** — press M or click 🔊 button to toggle audio
- **Persistent player name** — your name is saved to localStorage, no re-entry needed
- **Game over screen** — dramatic overlay showing final score, level reached, and credits

---

## Difficulty Progression

The game generates difficulty on the fly — no hardcoded level caps.

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

No build tools or servers needed.

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

### Option 3: Streamlit Cloud (live)

Visit **[bombay-asteroids.streamlit.app](https://bombay-asteroids.streamlit.app/)** — auto-deploys on every push.

---

## Project Structure

```
bombay-asteroids/
├── index.html
├── script.js
├── style.css
├── app.py
├── requirements.txt
├── README.md
└── assets/graphics/
    ├── spaceship_full.svg
    ├── asteroid1.svg
    ├── asteroid2.svg
    ├── green_projectile.svg
    └── explosion.svg
```

---

## Learning Journey

Built as a hands-on extension of **"Problem Solving with Abstraction"** by [Programming 2.0](https://www.youtube.com/@programming2point0).

Started with [programming2point0/asteroids](https://github.com/programming2point0/asteroids), then added:
- Leaflet.js map integration with parallax drift
- Infinite procedural difficulty generation
- Per-level countdown timer mechanic
- Asteroid directional angles (introduces complexity)
- Health powerups (resource management)
- Streamlit Cloud deployment (bundled assets)

### Key concepts

| Concept | Applied to |
|---|---|
| **Abstraction** | Modular game functions (moveShip, moveAsteroids, fireShot, driftMap) |
| **Game loop** | requestAnimationFrame + delta-time physics |
| **Procedural generation** | getLevelConfig(level) scales difficulty forever |
| **Collision detection** | Euclidean distance vs. combined radii (circle-based) |
| **Physics** | Velocity-based movement with sub-pixel accuracy |
| **Deployment** | GitHub Pages (static) + Streamlit Cloud (dynamic) |

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
- **Framework**: [Leaflet.js](https://leafletjs.com/)

---

<p align="center">
  <sub>Built with curiosity, code, and neon lights ✨</sub>
</p>
