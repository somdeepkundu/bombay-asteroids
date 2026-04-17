# Bombay Asteroids

A high-octane arcade shooter with infinite procedural difficulty, built with vanilla HTML, CSS, and JavaScript. Pilot your spaceship above Mumbai, dodge and destroy asteroids, and survive the countdown timer.

**Live:** [bombay-asteroids.streamlit.app](https://bombay-asteroids.streamlit.app/)  
**GitHub Pages:** [somdeepkundu.github.io/bombay-asteroids](https://somdeepkundu.github.io/bombay-asteroids/)

---

## Features

🎮 **Infinite Procedural Difficulty**
- Levels scale forever — no ceiling
- Each level: more asteroids, faster speeds, wilder angles
- Countdown timer shrinks per level (52s → 10s floor)

🗺️ **Leaflet Map Background**
- Game world centered on IIT Bombay, Mumbai
- Dark tile layer with parallax drift effect (simulates forward flight)
- Map panning speed scales with level

🎯 **Arcade Mechanics**
- Circle-based collision detection (accurate and fast)
- Delta-time physics (frame-rate independent)
- Health powerups spawn every 15 seconds
- Neon HUD: health bar, score, level, timer

✨ **Polish**
- Spaceship logo that floats above the title
- Level-up flash banner with glow effect
- Colorful timer that pulses red when ≤10s
- Smooth animations throughout

---

## How to Play

### Controls

| Key | Action |
|---|---|
| **W** / **↑** | Move up |
| **A** / **←** | Move left |
| **S** / **↓** | Move down |
| **D** / **→** | Move right |
| **SPACE** | Fire shot |

### Objective

1. **Dodge incoming asteroids** — collisions drain health
2. **Shoot asteroids** — each kill = **+10 points**
3. **Survive the countdown** — every level has a time limit
4. **Advance levels** — higher scores unlock harder challenges
5. **Stay alive** — health reaches 0 or timer runs out = **GAME OVER**

### Difficulty Progression

| Level | Score | Time | Asteroids | Horizontal Speed |
|---|---|---|---|---|
| 1 | 0 | 52s | 3 | Straight |
| 2 | 50 | 48s | 5 | Straight |
| 3 | 130 | 44s | 7 | ±60 px/s |
| 4 | 250 | 40s | 9 | ±120 px/s |
| 5 | 410 | 36s | 11 | ±180 px/s |
| 6 | 620 | 32s | 13 | ±250 px/s |
| 7+ | — | 10s floor | up to 32 | Increasingly chaotic |

---

## Project Structure

```
bombay-asteroids/
├── index.html              # Game markup — gamefield, HUD, start screen, instructions
├── script.js               # Game engine — movement, physics, collision, procedural levels
├── style.css               # Neon arcade theme — glows, animations, responsive layout
├── app.py                  # Streamlit wrapper (bundles everything for Cloud deployment)
├── requirements.txt        # Python dependencies for Streamlit
├── README.md               # This file
└── assets/graphics/        # SVG sprites
    ├── spaceship_full.svg
    ├── asteroid1.svg
    ├── asteroid2.svg
    ├── green_projectile.svg
    └── explosion.svg
```

---

## Deployment

### GitHub Pages (Static)

Push to `main` branch → GitHub automatically builds and serves from `/` (root).

Live at: `https://somdeepkundu.github.io/bombay-asteroids/`

### Streamlit Cloud (Dynamic)

1. Sign in to [share.streamlit.io](https://share.streamlit.io) with GitHub
2. Click **New app** → select this repo, branch `main`, file `app.py`
3. Auto-deploys on every push

Live at: `https://somdeepkundu-bombay-asteroids-app-XXXX.streamlit.app/`

---

## Technical Highlights

**Game Loop**
- `requestAnimationFrame` for smooth 60 FPS
- Delta-time based physics (frame-rate independent)
- Accumulator pattern for sub-pixel accuracy

**Difficulty**
- Procedurally generated per level using a scaling function
- Asteroid count, speed range, horizontal drift, and timer all linked to score thresholds
- No hardcoded level caps — difficulty grows forever

**Collision Detection**
- Euclidean distance vs. combined radii (circle-based)
- O(n) checks per frame (acceptable for 30 asteroids)
- Responsive feedback (explosions, score, health drain)

**Assets**
- All sprites inline as SVG or base64 data URIs (no external asset folder)
- Works offline after first load
- Streamlit-safe: relative paths rewritten to base64 for iframe sandboxing

**Neon Aesthetics**
- CSS custom properties for consistent color tokens
- Glowing text shadows on interactive elements
- Smooth transitions and animations throughout
- Dark mode by default (high contrast, easy on eyes)

---

## Learning & Attribution

This project was built as a hands-on exercise following **"Problem Solving with Abstraction"** by [Programming 2.0](https://www.youtube.com/@programming2point0) (YouTube).

### Concepts Practiced

| Concept | Applied to |
|---|---|
| **Abstraction** | Functions separated by responsibility (movement, shooting, collision, rendering) |
| **Game loop pattern** | `requestAnimationFrame` + delta-time for consistent game speed |
| **Physics** | Velocity-based movement, collision response, accumulator for precision |
| **Procedural generation** | Infinite level scaling without hardcoded arrays |
| **DOM manipulation** | Dynamic element creation/removal (shots, asteroids, explosions) |
| **Event handling** | Keyboard input with state tracking and auto-repeat prevention |
| **CSS animations** | Keyframes for spinning asteroids, pulsing UI, level-up flashes |

---

## Credits

- **Developer:** Somdeep Kundu · [@RuDRA Lab](https://github.com/somdeepkundu), C-TARA, IIT Bombay
- **Tutorial:** [Programming 2.0](https://www.youtube.com/@programming2point0) — *Problem Solving with Abstraction*
- **Graphics:** Free assets from [FreePik](https://www.freepik.com/)
  - [Asteroids](https://www.freepik.com/free-vector/asteroid-space-scene-background_5184427.htm)
  - [Spaceship](https://www.freepik.com/free-vector/futuristic-spaceship-collection-with-flat-design_2898815.htm)
  - [Shots](https://www.freepik.com/free-vector/game-handgun-blaster-shoot-light-effect_133958192.htm)
  - [Explosion](https://www.freepik.com/free-vector/cartoon-bomb-explosion-storyboard-animation_20902933.htm)
- **Map Tiles:** [Stadia Maps](https://stadiamaps.com/) (Dark mode background)
- **Framework:** [Leaflet.js](https://leafletjs.com/) (Map rendering)

---

## License

MIT — feel free to fork, modify, and deploy!

---

<p align="center">
  <sub>Built with curiosity, code, and neon lights ✨</sub>
</p>
