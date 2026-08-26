# Bombay Asteroids — Complete Game Guide

## 🎮 Game Overview

**Bombay Asteroids** is a high-octane arcade shooter built with vanilla HTML, CSS, and JavaScript. Pilot your spaceship above Mumbai and destroy incoming asteroids before they breach your hull. The game features infinite procedural difficulty, a live global leaderboard, and stunning neon visuals.

**Story:** It's July 17, 2027. Ancient asteroids have entered Earth's orbit, heading straight for Mumbai. As a pilot, you're humanity's last line of defense—positioned high above the city to intercept the rocks before they reach twelve million people below.

---

## 🕹️ How to Play

### Controls

| Action | Desktop | Mobile |
|--------|---------|--------|
| **Move** | `W A S D` or Arrow Keys | 🕹️ Analog Joystick |
| **Shoot** | `SPACE` (hold for auto-fire at Lv 10+) | 🔴 FIRE Button |
| **Pause** | `P` or `ESC` (one use per game) | Button at top |
| **Mute SFX** | `M` or 🔊 button | 🔊 Button |
| **Toggle Music** | 🥁 button | 🥁 Button |

### Objective

1. **Destroy asteroids** before they breach your ship's hull
2. **Survive the countdown timer** for each level
3. **Collect powerups** for health, time, and shields
4. **Reach the highest level** for maximum score
5. **Make the leaderboard** to be remembered forever

---

## 🎯 Game Mechanics

### Asteroids

- **Large asteroids** (50px) appear from Levels 1+
  - Break into **2 fast small asteroids** from Level 8+
  - Each split awards **+10 pts**
- **Small asteroids** (28px) fall continuously
  - Destroyed for **+15 pts** each
  - Move at increasing speeds as you level up

### Health & Hull

- Start with **100% hull integrity**
- Each asteroid hit: **-10% health**
- Game ends when health reaches **0%**
- Health bar shows your remaining durability in real-time

### Powerups

| Powerup | Frequency | Effect | Color |
|---------|-----------|--------|-------|
| ❤️ **Health** | Every 15s | Restore **40% hull** | Green |
| ⏱️ **Time Boost** | Every 22s | Add **+12 seconds** | Yellow |
| 🛡️ **Shield** | Every 35s | **5 sec invincibility** | Cyan |

### Levels & Difficulty

Each level increases challenge:

| Level | Asteroids | Time | Features |
|-------|-----------|------|----------|
| **1** | 5 | 52s | Introduction |
| **2** | 7 | 48s | Slight drift begins |
| **3** | 9 | 44s | Heavy horizontal drift |
| **4** | 11 | 40s | 🔒 Roll/Pitch lock starts |
| **5-7** | 13-15 | 36-28s | Increasing speed |
| **8+** | 16+ | ≥20s | 💥 Asteroids split |
| **∞** | 16 (capped) | 10s (floor) | Chaotic, uncapped speed |

### Special Mechanics

**Roll/Pitch Locks (Level 4+)**
- Random axis locks every few seconds for 6 seconds
- 5-second warning countdown appears
- Limits your movement to test your skills

**Auto-Fire (Level 10+)**
- Hold `SPACE` or tap `FIRE` to shoot continuously
- No more frantic button mashing!

**Shield Invincibility**
- Glowing blue aura around your ship
- Protects from all asteroid damage
- Lasts exactly 5 seconds

---

## ✨ Visual Features

### Glow Effects

**Asteroid Glow**
- Cyan halos pulse around asteroids
- Improves visibility against the dark map
- Creates visual hierarchy

**Ship Aura**
- Breathing green glow around your spaceship
- Pulses at 1.5s intervals
- Conveys life and presence

**Powerup Radiance**
- Golden shine with warm orange shadow
- Fast 0.8s pulse
- Draws your attention to valuable pickups

### Animations

- **Smooth waypoint transitions** (8 seconds) as you move across Mumbai
- **Exploding asteroids** with expanding scale + fade
- **Level-up banners** sliding in with glow effects
- **Pause screen** with cinematic blur backdrop
- **Smooth intro** text typewriter animation (no lag!)

### Dark Map Background

- **OpenTopoMap** tiles with 30% semi-transparent overlay
- Creates perfect contrast for neon UI elements
- Shows detailed Mumbai geography at Level 1-2, abstract at higher levels

---

## 🎵 Audio

**Web Audio API** (procedurally generated, zero external files):
- 🔥 **Laser shots** — rising frequency sweep
- 💥 **Explosions** — white noise filtered down
- 💚 **Health pickup** — ascending chord (musical)
- ⏱️ **Time boost** — rising arpeggio (rewarding)
- 🎉 **Level-up** — triumphant fanfare
- 📻 **Background tabla music** — Indian rhythm (when enabled)

All audio can be muted independently via buttons or keyboard.

---

## 🏆 Leaderboard

### How It Works

1. **Submit your score** when the game ends
2. **Top 10 scores displayed** on the game-over screen
3. **Global leaderboard** stored on Google Cloud
4. **Profanity filter** protects the public board
5. **Score includes:** name, score, level reached, date/time, game version

### Rank Your Score

- **Score alone doesn't count levels** — a score of 1000 at Level 2 is different from Level 20
- **Levels are tracked** — leaderboard shows how far you got
- **Personal best badge** — gold star appears if you beat your previous record

### Compete

- **No time pressure** for submissions (they're saved when you die)
- **No player limit** — submit as many scores as you want
- **Fair play** — no cheating detection yet (play with honor!)

---

## 🚀 Getting Started

### Play Online (Fastest)

Open in any browser:
```
https://somdeepkundu.github.io/bombay-asteroids/
```

No installation, no setup. Play instantly.

### Run Locally

```bash
git clone https://github.com/somdeepkundu/bombay-asteroids.git
cd bombay-asteroids
python -m http.server 8000
# Visit http://localhost:8000
```

### Install as PWA (Mobile)

- Open the game in your mobile browser
- Tap the "Install" or "Add to Home Screen" option
- Opens as a full-screen app with offline support

---

## 👨‍💻 For Developers

### Project Structure

```
bombay-asteroids/
├── index.html              # Game HTML + PWA meta
├── script.js               # Game logic (45KB, fully self-contained)
├── style.css               # Neon arcade styling
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (offline cache)
├── README.md               # Quick start
├── GUIDE.md                # This file
├── DETAILED.md             # Full technical docs
├── backend/                # Leaderboard API (Flask + Firestore)
└── assets/graphics/        # SVG game assets
```

### Architecture

**Frontend:**
- Vanilla JavaScript (no frameworks)
- Leaflet.js for map background
- Web Audio API for sound
- RequestAnimationFrame for game loop
- Delta-time physics for frame-rate independence

**Backend:**
- Flask REST API
- Google Cloud Firestore for persistence
- Google Cloud Run for hosting
- CORS enabled for GitHub Pages

### Customization

**Change animation speeds:**
```javascript
// In script.js, line 231-232
const WAYPOINT_ANIMATION_DURATION = 8;  // seconds
const WAYPOINT_DRIFT_RESUME_DELAY = 8200;  // ms
```

**Adjust difficulty:**
```javascript
// In script.js, function getLevelConfig()
// Modify asteroids per level, time limits, speeds
```

**Modify glow effects:**
```css
/* In style.css, search "GLOW EFFECTS" */
@keyframes asteroid-glow { ... }
@keyframes ship-pulse { ... }
@keyframes powerup-shine { ... }
```

**Change map tiles:**
```javascript
// In script.js, line 296
L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png')
```

### Version History

| Version | Release Date | What's New |
|---------|--------------|-----------|
| v2.1.7 | Aug 2026 | Glow effects, 8s transitions, smooth intro |
| v2.1.6 | Aug 2026 | Code refactoring, animation constants |
| v2.1.5 | Aug 2026 | Smooth waypoint transitions |
| v2.1.4 | Aug 2026 | OpenTopoMap tiles (no API key) |
| v2.1.3 | Aug 2026 | Waypoint system (different Mumbai locations) |

---

## 💡 Tips & Tricks

### For New Players

1. **Learn the pattern** — asteroids fall in predictable paths (Level 1-2)
2. **Use the shield wisely** — save it for tight situations
3. **Watch the timer** — it's your real enemy, not the rocks
4. **Collect powerups** — they're essential for survival
5. **Practice dodging** — mastering movement > mastering aim

### For Advanced Players

1. **Level 8+ splits are your friend** — large asteroids worth more when split
2. **Stay centered** — easier to dodge asteroids from middle of screen
3. **Manage time** — prioritize time boosts in tight rounds
4. **Roll/Pitch locks** — the 5s warning gives you reaction time
5. **Auto-fire is fast** — use it at Level 10+ for rapid-fire sequences

### Speed Run Strategy

1. Destroy large asteroids ASAP (splits = more points)
2. Ignore small asteroids if timer is low
3. Grab every time boost instantly
4. Don't waste shields early
5. Accept that Level 20+ is about survival, not perfection

---

## 📱 Platform Support

| Browser | Status |
|---------|--------|
| Chrome | ✅ Full support |
| Firefox | ✅ Full support |
| Safari | ✅ Full support |
| Edge | ✅ Full support |
| Mobile Safari | ✅ Full support (PWA ready) |
| Chrome Mobile | ✅ Full support (PWA ready) |

---

## 🎓 Learning Resources

**If you want to understand the code:**

1. **Game loop** — `requestAnimationFrame` + delta-time physics
2. **Collision detection** — Euclidean distance vs. combined radii
3. **Procedural generation** — `getLevelConfig(level)` scales infinitely
4. **Web Audio** — Oscillators + noise buffers (no external files!)
5. **Leaflet.js** — Map interactions + marker positioning

**Built as an extension of:**
- [Problem Solving with Abstraction](https://www.youtube.com/@programming2point0) by Programming 2.0
- Original base: [asteroids](https://github.com/programming2point0/asteroids)

---

## 🔗 Links

- **Play online:** https://somdeepkundu.github.io/bombay-asteroids/
- **GitHub:** https://github.com/somdeepkundu/bombay-asteroids
- **Video:** https://youtu.be/4pejCuZ3O9o
- **Streamlit version:** https://bombay-asteroids.streamlit.app/

---

## ⚖️ License

MIT License — Free to use, modify, and distribute.

---

## 🏆 Credits

- **Developer:** Somdeep Kundu (@RuDRA Lab, C-TARA, IIT Bombay)
- **Tutorial:** Programming 2.0
- **Graphics:** FreePik
- **Map tiles:** OpenTopoMap (OpenStreetMap contributors)
- **Backend:** Google Cloud Run + Firestore
- **Music:** Original tabla composition

---

**Built with curiosity, code, and neon lights ✨**

*Good luck, Pilot. Mumbai is counting on you.*
