// ─────────────────────────────────────────────────────
//  Bombay Asteroids  —  fully self-contained build
//  All graphics are inline SVG data-URIs; no external
//  asset folder required. Drop the three files into any
//  GitHub Pages repo and it works immediately.
// ─────────────────────────────────────────────────────

const VERSION = "v2.3.9";

// ── Mumbai waypoints — each level lands on a different neighbourhood ──
const MUMBAI_WAYPOINTS = [
  { name: 'IIT Bombay',       lat: 19.1334, lng: 72.9133 },
  { name: 'Powai Lake',       lat: 19.1212, lng: 72.9064 },
  { name: 'Andheri',          lat: 19.1197, lng: 72.8464 },
  { name: 'Juhu Beach',       lat: 19.0968, lng: 72.8265 },
  { name: 'Bandra',           lat: 19.0544, lng: 72.8402 },
  { name: 'Sea Link',         lat: 19.0377, lng: 72.8180 },
  { name: 'Dharavi',          lat: 19.0434, lng: 72.8554 },
  { name: 'Lower Parel',      lat: 18.9943, lng: 72.8265 },
  { name: 'Marine Drive',     lat: 18.9430, lng: 72.8244 },
  { name: 'Gateway of India', lat: 18.9220, lng: 72.8347 },
];
function waypointFor(level) { return MUMBAI_WAYPOINTS[level % MUMBAI_WAYPOINTS.length]; }

// ── Leaderboard API ──────────────────────────────────
const LEADERBOARD_API = 'https://bombay-asteroids-1028845604936.europe-west1.run.app'; // Google Cloud Run

const EXPLOSION_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><circle cx='30' cy='30' r='28' fill='%23ff7b00' opacity='0.7'/><circle cx='30' cy='30' r='18' fill='%23ffd60a' opacity='0.9'/><circle cx='30' cy='30' r='9' fill='%23ffffff' opacity='0.95'/><polygon points='30,0 34,24 58,30 34,36 30,60 26,36 2,30 26,24' fill='%23ff006e' opacity='0.55'/></svg>`;

const HEALTH_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='5' fill='%23001a00' opacity='0.7'/><path d='M19 10.5H13.5V5H10.5V10.5H5V13.5H10.5V19H13.5V13.5H19V10.5Z' fill='%2339ff14'/></svg>`;

// Clock (left) + plus sign (right) = time boost pickup
const TIMEBOOST_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230a0a2e' opacity='0.9'/><circle cx='14' cy='19' r='9' fill='none' stroke='%2300fff5' stroke-width='2'/><line x1='14' y1='15' x2='14' y2='19' stroke='%2300fff5' stroke-width='2.5' stroke-linecap='round'/><line x1='14' y1='19' x2='17' y2='21' stroke='%2300fff5' stroke-width='2.5' stroke-linecap='round'/><line x1='26' y1='8' x2='26' y2='14' stroke='%2300fff5' stroke-width='2.5' stroke-linecap='round'/><line x1='23' y1='11' x2='29' y2='11' stroke='%2300fff5' stroke-width='2.5' stroke-linecap='round'/></svg>`;

const SHIELD_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230a0a2e' opacity='0.9'/><path d='M16 4 L26 8 L26 17 C26 22 21 26 16 28 C11 26 6 22 6 17 L6 8 Z' fill='none' stroke='%2300b4ff' stroke-width='2.2'/><path d='M16 9 L22 12 L22 18 C22 21 19 23 16 24.5 C13 23 10 21 10 18 L10 12 Z' fill='%2300b4ff' opacity='0.25'/></svg>`;

// Asset paths (real SVG files from abstract-asteroids)
const ASSETS = {
  spaceship: 'assets/graphics/spaceship_full.svg',
  asteroid1: 'assets/graphics/asteroid1.svg',
  asteroid2: 'assets/graphics/asteroid2.svg',
  shot:      'assets/graphics/green_projectile.svg',
  explosion: 'assets/graphics/explosion.svg',
};

// ── Audio system (Web Audio API, fully procedural) ───
let audioCtx   = null;
let soundMuted = false;
let _lastLaser = 0;

let bgMusic    = null;
let musicMuted = false;

function initMusic() {
  bgMusic = document.getElementById('bg-music');
  if (!bgMusic) {
    console.log('❌ Audio element not found');
    return;
  }

  console.log('✓ Audio element found, readyState:', bgMusic.readyState, 'networkState:', bgMusic.networkState);

  bgMusic.volume = 0.35;
  bgMusic.muted = false;
  bgMusic.currentTime = 0;

  // Ensure the audio element starts loading
  bgMusic.load();

  // Check loading status
  const checkReady = setInterval(() => {
    if (bgMusic.readyState >= 2) { // HAVE_CURRENT_DATA or better
      clearInterval(checkReady);
      console.log('✓ Audio loaded, readyState:', bgMusic.readyState);
      attemptPlay();
    }
  }, 100);

  function attemptPlay() {
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => console.log('✓ Tabla music playing'))
        .catch(err => {
          console.log('⚠️ Autoplay blocked (' + err.name + ') — will play on next user click');
          // Unlock on next click
          document.addEventListener('click', playOnClick, { once: true });
        });
    }
  }

  function playOnClick() {
    bgMusic.play().catch(e => console.log('❌ Click-triggered play failed:', e.message));
  }
}

function toggleMuteMusic() {
  musicMuted = !musicMuted;
  if (bgMusic) bgMusic.muted = musicMuted;
  const btn = document.getElementById('music-btn');
  if (btn) {
    btn.textContent = musicMuted ? '🔕' : '🥁';
    btn.classList.toggle('muted', musicMuted);
  }
}

function _ctx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function toggleMute() {
  soundMuted = !soundMuted;
  const btn = document.getElementById('mute-btn');
  if (btn) btn.textContent = soundMuted ? '🔇' : '🔊';
}

function playLaser() {
  if (soundMuted) return;
  const ctx = _ctx(), now = ctx.currentTime;
  if (now - _lastLaser < 0.08) return;   // throttle during auto-fire
  _lastLaser = now;
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.type = 'square';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.14);
  g.gain.setValueAtTime(0.22, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
  osc.start(now); osc.stop(now + 0.14);
}

function playExplosion() {
  if (soundMuted) return;
  const ctx = _ctx(), now = ctx.currentTime;
  const len = Math.floor(ctx.sampleRate * 0.45);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf;
  const flt = ctx.createBiquadFilter(); flt.type = 'lowpass';
  flt.frequency.setValueAtTime(500, now);
  flt.frequency.exponentialRampToValueAtTime(60, now + 0.45);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.5, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  src.connect(flt); flt.connect(g); g.connect(ctx.destination);
  src.start(now); src.stop(now + 0.45);
}

function playHealthPickup() {
  if (soundMuted) return;
  const ctx = _ctx(), now = ctx.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const t = now + i * 0.1;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = 'sine'; osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.28, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.start(t); osc.stop(t + 0.22);
  });
}

function playTimePickup() {
  if (soundMuted) return;
  const ctx = _ctx(), now = ctx.currentTime;
  [440, 554.37, 659.25, 880].forEach((freq, i) => {
    const t = now + i * 0.07;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.start(t); osc.stop(t + 0.16);
  });
}

function playLevelUp() {
  if (soundMuted) return;
  const ctx = _ctx(), now = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const t = now + i * 0.11;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    osc.start(t); osc.stop(t + 0.24);
  });
}

// ── Infinite procedural difficulty ───────────────────
const _lvlCfgCache = new Map();
function getLevelConfig(lvl) {
  if (_lvlCfgCache.has(lvl)) return _lvlCfgCache.get(lvl);
  const cfg = {
    count:     Math.min(3 + lvl * 2, 16),
    speedMin:  50  + lvl * 15,
    speedMax:  Math.min(100 + lvl * 28, 280),
    vxMax:     Math.max(0, Math.min((lvl - 2) * 65, 200)),
    timeLimit: Math.max(10, 52 - lvl * 4),
    label:     'LEVEL ' + (lvl + 1),
    hasLock:   lvl >= 3,
  };
  _lvlCfgCache.set(lvl, cfg);
  return cfg;
}

function scoreToReachLevel(lvl) {
  let s = 0;
  for (let i = 0; i < lvl; i++) s += 50 + i * 40;
  return s;
}

let currentLevel = 0;
let levelTimer   = 0;
let driftAngle   = Math.PI / 2;   // current heading (radians)
let map, W, H;
let playerName   = "Player";

// ── Auto-fire ─────────────────────────────────────────
const AUTO_FIRE_INTERVAL = 0.18;   // seconds between shots when held
let autoFireTimer = 0;

// ── Roll / Pitch lock ─────────────────────────────────
let lockAxis            = null;    // 'x' | 'y' | null
let lockState           = 'none';  // 'none' | 'warning' | 'locked'
let lockTimer           = 0;       // seconds remaining while locked
let lockWarnTimer       = 0;       // countdown before lock engages
let lockScheduleTimeout = null;

function scheduleLock() {
  if (gameOver || lockState !== 'none') return;
  if (!getLevelConfig(currentLevel).hasLock) return;
  if (lockScheduleTimeout) clearTimeout(lockScheduleTimeout);
  const delay = 10000 + Math.random() * 10000;   // 10-20 s into the level
  lockScheduleTimeout = setTimeout(() => {
    lockScheduleTimeout = null;
    if (!gameOver && lockState === 'none') startLockWarning();
  }, delay);
}

function startLockWarning() {
  lockAxis      = Math.random() < 0.5 ? 'x' : 'y';
  lockState     = 'warning';
  lockWarnTimer = 5;
  updateLockUI();
}

function updateLockUI() {
  const el = document.getElementById('lock-warning');
  if (!el) return;
  if (lockState === 'warning') {
    el.className = 'warn';
    el.textContent = `⚠ ${lockAxis === 'x' ? 'ROLL' : 'PITCH'} LOCK IN ${Math.ceil(lockWarnTimer)}`;
    el.style.display = 'block';
  } else if (lockState === 'locked') {
    el.className = 'locked';
    el.textContent = `⛔ ${lockAxis === 'x' ? 'ROLL' : 'PITCH'} LOCKED — ${Math.ceil(lockTimer)}s`;
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

// ── Map initialisation ────────────────────────────────
function initMap() {
  W = window.innerWidth;
  H = window.innerHeight;

  const mapEl = document.getElementById('map');
  if (mapEl) {
    mapEl.style.transformOrigin = '50% 50%';
    mapEl.style.willChange      = 'transform';
  }

  const start = waypointFor(0);
  map = L.map('map', {
    center: [start.lat, start.lng],
    zoom: 15,
    zoomControl: false,
    attributionControl: true,
    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> ' +
      '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map);
}

function px(x, y) {
  return map.containerPointToLatLng(L.point(x, y));
}

// ── Keyboard controls ─────────────────────────────────
const controls = {
  up: false, down: false, left: false, right: false,
  spaceHeld: false,
  jx: 0, jy: 0,   // analog joystick axes
};

function keypressHandler(e) {
  const v = e.type === 'keydown';
  if (e.key === 'a' || e.key === 'ArrowLeft')  { controls.left  = v; e.preventDefault(); }
  if (e.key === 'w' || e.key === 'ArrowUp')    { controls.up    = v; e.preventDefault(); }
  if (e.key === 's' || e.key === 'ArrowDown')  { controls.down  = v; e.preventDefault(); }
  if (e.key === 'd' || e.key === 'ArrowRight') { controls.right = v; e.preventDefault(); }
  if ((e.key === 'm' || e.key === 'M') && v)   { toggleMute(); }
  if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && v) { togglePause(); }
  if (e.key === ' ') {
    e.preventDefault();
    if (v && !controls.spaceHeld) {
      fireShot();
      controls.spaceHeld = true;
      autoFireTimer = AUTO_FIRE_INTERVAL;
    }
    if (!v) { controls.spaceHeld = false; autoFireTimer = 0; }
  }
}

// ── Spaceship ─────────────────────────────────────────
const ship = { x: 0, y: 0, s: 300, w: 60, h: 80, hl: 100 };
let shipMarker;

function initShip() {
  ship.x = W / 2;
  ship.y = H * 0.75;
  shipMarker = L.marker(px(ship.x, ship.y), {
    icon: L.divIcon({
      className: '',
      html: `<img src="${ASSETS.spaceship}" width="60" height="80" style="display:block;filter:drop-shadow(0 0 10px rgba(0,255,245,0.8)) drop-shadow(0 0 22px rgba(0,255,245,0.4))">`,
      iconSize: [60, 80],
      iconAnchor: [30, 40],
    }),
    interactive: false,
    zIndexOffset: 500,
  }).addTo(map);
}

function moveShip(dt) {
  const canX = !(lockState === 'locked' && lockAxis === 'x');
  const canY = !(lockState === 'locked' && lockAxis === 'y');

  // Digital (keyboard)
  if (canX) {
    if (controls.left  && ship.x > ship.w / 2)     ship.x -= ship.s * dt;
    if (controls.right && ship.x < W - ship.w / 2) ship.x += ship.s * dt;
  }
  if (canY) {
    if (controls.up   && ship.y > ship.h / 2)      ship.y -= ship.s * dt;
    if (controls.down && ship.y < H - ship.h / 2)  ship.y += ship.s * dt;
  }

  // Analog joystick — speed proportional to thumb offset from centre
  if (controls.jx !== 0 || controls.jy !== 0) {
    if (canX) ship.x = Math.max(ship.w / 2, Math.min(W - ship.w / 2, ship.x + controls.jx * ship.s * dt));
    if (canY) ship.y = Math.max(ship.h / 2, Math.min(H - ship.h / 2, ship.y + controls.jy * ship.s * dt));
  }
}

// ── Asteroids ─────────────────────────────────────────
const asteroids = [];
let _asteroidPool = [];
let _poolSize = 100;

// Pre-create asteroid marker pool at game start
function initAsteroidPool() {
  for (let i = 0; i < _poolSize; i++) {
    const marker = L.marker(px(-500, -500), {
      icon: L.divIcon({ className: '', html: '<div></div>', iconSize: [50, 50], iconAnchor: [25, 25] }),
      interactive: false,
    }).addTo(map);
    _asteroidPool.push({ marker, active: false });
  }
}

function spawnAsteroid(opts = {}) {
  const src  = Math.random() < 0.5 ? ASSETS.asteroid1 : ASSETS.asteroid2;
  const lvl  = getLevelConfig(currentLevel);
  const size = opts.size || 'large';
  const dim  = size === 'large' ? 50 : 28;

  // Reuse from pool or create new if pool exhausted
  let pooledMarker = _asteroidPool.find(p => !p.active);
  if (!pooledMarker) {
    pooledMarker = { marker: L.marker(px(-500, -500), { icon: L.divIcon({ className: '', html: '<div></div>', iconSize: [dim, dim], iconAnchor: [dim/2, dim/2] }), interactive: false }).addTo(map), active: false };
    _asteroidPool.push(pooledMarker);
  }

  const obj = {
    x:    opts.x  !== undefined ? opts.x  : Math.random() * W,
    y:    opts.y  !== undefined ? opts.y  : -30,
    w: dim, h: dim, size,
    s:    opts.s  !== undefined ? opts.s  : Math.random() * (lvl.speedMax - lvl.speedMin) + lvl.speedMin,
    vx:   opts.vx !== undefined ? opts.vx : (Math.random() * 2 - 1) * lvl.vxMax,
    marker: pooledMarker.marker,
    pooled: true,
  };

  // Update marker HTML and position
  const html = `<img src="${src}" width="${dim}" height="${dim}" class="asteroid-spin" style="display:block;filter:drop-shadow(0 0 6px rgba(255,80,80,0.5))">`;
  obj.marker.setIcon(L.divIcon({ className: '', html, iconSize: [dim, dim], iconAnchor: [dim/2, dim/2] }));
  obj.marker.setLatLng(px(obj.x, obj.y));

  pooledMarker.active = true;
  asteroids.push(obj);
}

function splitAsteroid(a) {
  explodeAt(a.x, a.y);
  const speed = a.s * 1.4;
  for (let i = 0; i < 2; i++) {
    const angle = (i === 0 ? -1 : 1) * (Math.PI / 5 + Math.random() * Math.PI / 5);
    spawnAsteroid({ size: 'small', x: a.x, y: a.y, s: speed, vx: Math.sin(angle) * speed * 0.6 });
  }
}

function moveAsteroids(dt) {
  for (const a of asteroids) {
    a.y += a.s * dt;
    a.x += a.vx * dt;
    if (a.y > H + 30 || a.x < -60 || a.x > W + 60) resetAsteroid(a);
  }
}

function resetAsteroid(a) {
  a.y  = -30;
  a.x  = Math.random() * W;
  const lvl = getLevelConfig(currentLevel);
  a.s  = Math.random() * (lvl.speedMax - lvl.speedMin) + lvl.speedMin;
  a.vx = (Math.random() * 2 - 1) * lvl.vxMax;
}

// ── Powerups (health + time boost) ───────────────────
const powerups = [];

function spawnHealth() {
  if (gameOver) return;
  _spawnPowerup('health', HEALTH_SVG,    'health-pulse',
    'rgba(57,255,20,0.9)', 'rgba(57,255,20,0.5)', 80);
}

function spawnTimeBoost() {
  if (gameOver) return;
  _spawnPowerup('time',   TIMEBOOST_SVG, 'timeboost-pulse',
    'rgba(0,255,245,0.9)', 'rgba(0,255,245,0.5)', 70);
}

function spawnShield() {
  if (gameOver) return;
  _spawnPowerup('shield', SHIELD_SVG, 'shield-pulse',
    'rgba(0,180,255,0.9)', 'rgba(0,180,255,0.4)', 60);
}

function _spawnPowerup(type, svg, cls, c1, c2, speed) {
  const obj = {
    x: Math.random() * (W - 60) + 30, y: -30,
    w: 34, h: 34, s: speed, type,
  };
  obj.marker = L.marker(px(obj.x, obj.y), {
    icon: L.divIcon({
      className: '',
      html: `<img src="${svg}" width="34" height="34" class="${cls}" style="display:block;filter:drop-shadow(0 0 10px ${c1}) drop-shadow(0 0 20px ${c2})">`,
      iconSize: [34, 34], iconAnchor: [17, 17],
    }),
    interactive: false, zIndexOffset: 400,
  }).addTo(map);
  powerups.push(obj);
}

function movePowerups(dt) {
  for (let i = powerups.length - 1; i >= 0; i--) {
    powerups[i].y += powerups[i].s * dt;
    if (powerups[i].y > H + 30) {
      map.removeLayer(powerups[i].marker);
      powerups.splice(i, 1);
    }
  }
}

// ── Shots ─────────────────────────────────────────────
const shots = [];

function fireShot() {
  const obj = { x: ship.x, y: ship.y - ship.h / 2, w: 20, h: 30, s: 450 };
  obj.marker = L.marker(px(obj.x, obj.y), {
    icon: L.divIcon({
      className: '',
      html: `<img src="${ASSETS.shot}" width="20" height="30" style="display:block;filter:drop-shadow(0 0 8px rgba(57,255,20,0.95)) drop-shadow(0 0 18px rgba(57,255,20,0.5))">`,
      iconSize: [20, 30], iconAnchor: [10, 15],
    }),
    interactive: false, zIndexOffset: 200,
  }).addTo(map);
  shots.push(obj);
  playLaser();
}

function moveShots(dt) {
  for (let i = shots.length - 1; i >= 0; i--) {
    shots[i].y -= shots[i].s * dt;
    if (shots[i].y < -30) removeShot(shots[i]);
  }
}

function removeShot(shot) {
  map.removeLayer(shot.marker);
  shots.splice(shots.indexOf(shot), 1);
}

// ── Explosion flash ───────────────────────────────────
function explodeAt(x, y) {
  const m = L.marker(px(x, y), {
    icon: L.divIcon({
      className: '',
      html: `<img src="${EXPLOSION_SVG}" width="60" height="60" class="explode-anim" style="display:block">`,
      iconSize: [60, 60], iconAnchor: [30, 30],
    }),
    interactive: false, zIndexOffset: 300,
  }).addTo(map);
  setTimeout(() => map.removeLayer(m), 500);
  playExplosion();
}

// ── Collision detection ───────────────────────────────
function isColliding(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy) < (a.w / 2 + b.w / 2);
}

// ── Render ────────────────────────────────────────────
function render() {
  shipMarker.setLatLng(px(ship.x, ship.y));
  for (const a of asteroids) a.marker.setLatLng(px(a.x, a.y));
  for (const s of shots)     s.marker.setLatLng(px(s.x, s.y));
  for (const p of powerups)  p.marker.setLatLng(px(p.x, p.y));

  _elNumber.textContent        = String(points).padStart(3, '0');
  _elHealthbar.style.width     = `${Math.max(ship.hl, 0)}%`;
  _elLevelIndicator.textContent = getLevelConfig(currentLevel).label;
  const secs = Math.ceil(Math.max(levelTimer, 0));
  _elTimerNumber.textContent   = secs;
  _elTimer.classList.toggle('urgent', secs <= 10);
}

// ── Difficulty progression ────────────────────────────
function getLevelIndex(score) {
  let lvl = 0;
  while (scoreToReachLevel(lvl + 1) <= score) lvl++;
  return lvl;
}

function levelUp(newIdx) {
  currentLevel = newIdx;
  const lvl = getLevelConfig(currentLevel);
  levelTimer = lvl.timeLimit;
  while (asteroids.length < lvl.count) spawnAsteroid();
  showLevelBanner(lvl.label);
  playLevelUp();
  if (lvl.hasLock) scheduleLock();
  // Map drifts smoothly on its own 3-second interval — no forced jumps
}

function showLevelBanner(label) {
  const el = document.createElement('div');
  el.className = 'level-banner';
  el.textContent = label;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 600);
  }, 1600);
}

// ── Map drift — simple southward scroll, constant speed ──
function _startMapDrift() {
  // 500ms interval = 2x/sec — much lighter on low-end phones
  setInterval(() => {
    if (!map || gameOver || paused) return;
    map.panBy([0, 12], { animate: true, duration: 0.5, noMoveStart: true });
  }, 500);
}

// ── Time-pickup flash on the timer display ───────────
function showTimePulse() {
  const el = document.getElementById('timer');
  if (!el) return;
  el.classList.add('time-gained');
  setTimeout(() => el.classList.remove('time-gained'), 900);
}

// ── Game loop ─────────────────────────────────────────
let points = 0, gameOver = false, lastTime = 0;
let paused = false, pauseUsed = false;
let shipShielded = false, shieldTimer = 0;

// ── Cached DOM refs (set once on game start, reused every frame) ──
let _elNumber, _elHealthbar, _elLevelIndicator, _elTimerNumber, _elTimer;
let personalBest = parseInt(localStorage.getItem('bombay_asteroids_best') || '0');

// ── Tick sub-steps (extracted from game loop) ────────
function tickLockMachine(dt) {
  if (lockState === 'warning') {
    lockWarnTimer -= dt;
    updateLockUI();
    if (lockWarnTimer <= 0) { lockState = 'locked'; lockTimer = 6; updateLockUI(); }
  } else if (lockState === 'locked') {
    lockTimer -= dt;
    updateLockUI();
    if (lockTimer <= 0) { lockState = 'none'; lockAxis = null; updateLockUI(); scheduleLock(); }
  }
}

function tickPowerupCollisions(dt) {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    if (!isColliding(p, ship)) continue;
    if (p.type === 'health') {
      ship.hl = Math.min(100, ship.hl + 40);
      playHealthPickup();
    } else if (p.type === 'time') {
      levelTimer = Math.min(levelTimer + 12, getLevelConfig(currentLevel).timeLimit + 12);
      showTimePulse();
      playTimePickup();
    } else if (p.type === 'shield') {
      shipShielded = true;
      shieldTimer  = 5;
      updateShieldGlow(true);
      playHealthPickup();
    }
    map.removeLayer(p.marker);
    powerups.splice(i, 1);
    break;
  }
}

// Returns true if the game ended (hull breach), so tick() can early-return.
function tickShipCollisions(dt) {
  for (const a of asteroids) {
    if (!isColliding(a, ship)) continue;
    const dx   = ship.x - a.x;
    const dy   = ship.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx   = dx / dist;
    const ny   = dy / dist;
    ship.x = Math.max(ship.w / 2, Math.min(W - ship.w / 2, ship.x + nx * 18));
    ship.y = Math.max(ship.h / 2, Math.min(H - ship.h / 2, ship.y + ny * 18));
    a.x -= nx * 15;
    a.vx = -nx * (a.s * 0.6);
    a.s  *= 0.85;

    // ── Map knockback (opposite direction of collision) ──
    if (map) {
      map.panBy([-nx * 10, -ny * 10], { animate: false, noMoveStart: true });
    }

    if (!shipShielded) {
      ship.hl -= 20 * dt;
      playExplosion();
      if (shipMarker) {
        const img = shipMarker.getElement()?.querySelector('img');
        if (img) {
          img.classList.remove('shock-anim');
          void img.offsetWidth;
          img.classList.add('shock-anim');
        }
      }
      if (ship.hl <= 0) { endGame("HULL BREACH"); return true; }
    }
  }
  return false;
}

function tickShotCollisions() {
  for (let i = shots.length - 1; i >= 0; i--) {
    const shot = shots[i];
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const a = asteroids[j];
      if (!isColliding(shot, a)) continue;
      if (a.size === 'large' && currentLevel >= 7) {
        points += 10;
        splitAsteroid(a);
      } else {
        points += a.size === 'large' ? 20 : 15;
        explodeAt(a.x, a.y);
      }
      // Return to pool instead of destroying
      a.marker.setLatLng(px(-500, -500));
      _asteroidPool.find(p => p.marker === a.marker).active = false;
      asteroids.splice(j, 1);
      removeShot(shot);
      break;
    }
  }
}

const _isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const _fpsLimit  = _isMobile ? 1000 / 30 : 1000 / 60; // 30fps mobile, 60fps desktop

function tick(ts) {
  if (gameOver || paused) return;
  requestAnimationFrame(tick);

  if (lastTime === 0) { lastTime = ts; return; }
  const elapsed = ts - lastTime;
  if (elapsed < _fpsLimit) return;   // skip frame if too soon
  const dt = Math.min(elapsed / 1000, 0.1);
  lastTime = ts;

  levelTimer -= dt;
  if (levelTimer <= 0) { endGame("TIME'S UP"); return; }

  if (shipShielded) {
    shieldTimer -= dt;
    if (shieldTimer <= 0) { shipShielded = false; updateShieldGlow(false); }
  }

  tickLockMachine(dt);

  // Continuous fire — Level 10+
  if (currentLevel >= 9 && controls.spaceHeld) {
    autoFireTimer -= dt;
    if (autoFireTimer <= 0) { fireShot(); autoFireTimer = AUTO_FIRE_INTERVAL; }
  }

  moveShip(dt);
  moveAsteroids(dt);
  moveShots(dt);
  movePowerups(dt);

  const newLevel = getLevelIndex(points);
  if (newLevel > currentLevel) levelUp(newLevel);

  tickPowerupCollisions(dt);
  if (tickShipCollisions(dt)) return;
  tickShotCollisions();

  // levelUp() only spawns on level-change; replenish here so shots never drain the field
  const targetCount = getLevelConfig(currentLevel).count;
  while (asteroids.length < targetCount) spawnAsteroid();

  render();
}

// ── Leaderboard API ─────────────────────────────────
async function saveToLeaderboard(name, score) {
  try {
    const response = await fetch(`${LEADERBOARD_API}/api/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score, version: VERSION, level: currentLevel + 1 })
    });
    if (response.ok) {
      console.log('✅ Score saved to leaderboard!');
      loadLeaderboard();
    }
  } catch (error) {
    console.error('❌ Leaderboard save failed:', error);
  }
}

async function loadLeaderboard() {
  try {
    const response = await fetch(`${LEADERBOARD_API}/api/leaderboard`);
    const scores = await response.json();
    displayLeaderboard(scores);
  } catch (error) {
    console.error('❌ Leaderboard load failed:', error);
  }
}

function displayLeaderboard(scores) {
  const el = document.getElementById('leaderboard-list');
  if (!el) return;
  el.innerHTML = scores.map((s, i) => `
    <div class="leaderboard-row ${i === 0 ? 'first' : ''} ${i === 1 ? 'second' : ''} ${i === 2 ? 'third' : ''}">
      <span class="rank">#${s.rank}</span>
      <span class="name">${s.name}</span>
      <span class="score">${s.score}</span>
      <span class="lb-meta">${s.date || ''} ${s.time || ''} ${s.version ? '· ' + s.version : ''}</span>
    </div>
  `).join('') || '<p style="color: #aaa; padding: 20px;">Loading leaderboard...</p>';
}

// ── Shield glow on ship ───────────────────────────────
function updateShieldGlow(on) {
  if (!shipMarker) return;
  const img = shipMarker.getElement()?.querySelector('img');
  // Keep to 2 drop-shadow layers (same as default ship glow) to avoid
  // per-frame GPU re-composite lag. Wider radius + full opacity = strong
  // visual without the extra compositing passes.
  if (img) img.style.filter = on
    ? 'drop-shadow(0 0 18px #00b4ff) drop-shadow(0 0 42px rgba(0,180,255,0.95))'
    : 'drop-shadow(0 0 10px rgba(0,255,245,0.8)) drop-shadow(0 0 22px rgba(0,255,245,0.4))';
}

// ── Pause (one use per game) ──────────────────────────
function togglePause() {
  if (gameOver) return;
  if (!paused) {
    if (pauseUsed) return;
    paused    = true;
    pauseUsed = true;
    document.getElementById('pause-overlay').style.display = 'flex';
    document.getElementById('pause-btn').textContent = '▶';
    document.getElementById('pause-btn').title = 'Resume';
  } else {
    paused    = false;
    lastTime  = 0;
    document.getElementById('pause-overlay').style.display = 'none';
    document.getElementById('pause-btn').textContent = '⏸';
    document.getElementById('pause-btn').disabled = true;
    document.getElementById('pause-btn').classList.add('used');
    requestAnimationFrame(tick);
  }
}

// ── Share score ───────────────────────────────────────
function shareScore(platform) {
  const txt = `🚀 I scored ${points} pts at Level ${currentLevel} in Bombay Asteroids!\nCan you beat me? Play here: https://somdeepkundu.github.io/bombay-asteroids/`;
  if (platform === 'whatsapp') {
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
  } else if (platform === 'share') {
    if (navigator.share) {
      navigator.share({ title: 'Bombay Asteroids', text: txt, url: 'https://somdeepkundu.github.io/bombay-asteroids/' });
    } else {
      navigator.clipboard.writeText(txt).then(() => alert('Score copied! Paste it on Instagram 📸'));
    }
  }
}

// ── Level transition screen ───────────────────────────
const LEVEL_HINTS = {
  2: '☄️ Asteroids getting faster...',
  3: '↙️ They drift sideways now',
  4: '🔒 Roll locks activated!',
  5: '💨 Speed ramping up',
  6: '🌀 Chaos mode approaching',
  7: '⚡ No mercy from here',
};

function showLevelBanner(label) {
  const existing = document.getElementById('level-transition');
  if (existing) existing.remove();

  const hint = LEVEL_HINTS[currentLevel] || '🛸 Stay focused, pilot';
  const el = document.createElement('div');
  el.id = 'level-transition';
  el.innerHTML = `
    <div class="lt-inner">
      <div class="lt-tag">LEVEL UP</div>
      <div class="lt-name">${label}</div>
      <div class="lt-hint">${hint}</div>
    </div>`;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add('lt-fade');
    setTimeout(() => el.remove(), 350);
  }, 1400);
}

// ── Game over ─────────────────────────────────────────
function endGame(reason) {
  gameOver = true;

  // Personal best
  const isNewBest = points > personalBest;
  if (isNewBest) {
    personalBest = points;
    localStorage.setItem('bombay_asteroids_best', points);
  }

  // Save score to leaderboard
  saveToLeaderboard(playerName, points);

  const div = document.createElement('div');
  div.id = 'gameover';
  div.innerHTML = `
    <div class="gameover-title">${reason || 'GAME OVER'}</div>
    ${isNewBest ? `<div class="personal-best-badge">🏅 NEW PERSONAL BEST!</div>` : `<div class="personal-best-info">Personal best: ${personalBest} pts</div>`}
    <div class="gameover-player">${playerName} &mdash; ${points} pts</div>
    <div class="gameover-level">Reached ${getLevelConfig(currentLevel).label}</div>
    <div class="share-row">
      <button class="share-btn whatsapp" onclick="shareScore('whatsapp')">📲 WhatsApp</button>
      <button class="share-btn insta"    onclick="shareScore('share')">📸 Instagram</button>
    </div>
    <div style="margin-top: 12px; padding: 12px; border-top: 1px solid rgba(255,255,255,0.2);">
      <div style="font-size: 12px; color: var(--neon-cyan); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">🏆 Top 10 Global</div>
      <div id="leaderboard-list" style="max-height: 180px; overflow-y: auto; font-size: 12px;"><div style="color:#445;font-size:11px;padding:8px 0">Loading scores...</div></div>
    </div>
    <div class="gameover-credit">Developed by Somdeep Kundu &middot; @RuDRA Lab, C-TARA, IITB</div>
    <div class="gameover-source">learned from &ldquo;Problem Solving with Abstraction&rdquo; by Programming 2.0 (YouTube)</div>
    
    <div style="margin-top: 10px;">
        <div style="color: rgba(255, 255, 255, 0.4); font-size: 10px; letter-spacing: 0.5px;">
            Tabla music: <span style="font-size: 14px; color: white; font-weight: bold;">Soumyadip Ghosh</span>
        </div>
        <div style="color: rgba(255, 255, 255, 0.4); font-size: 10px; margin-top: 4px;">
            Somdeep's Website: <a href="http://www.somdeepkundu.in" target="_blank" style="color: var(--neon-cyan); text-decoration: none;">www.somdeepkundu.in</a>
        </div>
        <div style="color: rgba(255, 255, 255, 0.4); font-size: 10px; margin-top: 4px;">
            Games current version's <a href="https://github.com/somdeepkundu/bombay-asteroids" target="_blank" style="color: var(--neon-cyan); text-decoration: none;">GitHub Repository</a>
        </div>
    </div>

    <button class="restart-btn" onclick="location.reload()">PLAY AGAIN</button>
  `;
  document.body.appendChild(div);

  loadLeaderboard();
}


// ── Mobile / tablet detection ─────────────────────────
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
function isTabletDevice() {
  return /(iPad|Android)/i.test(navigator.userAgent);
}

// ── Touch controls: analog joystick + fire ────────────
function setupTouchControls() {
  const isSmallScreen = window.innerWidth < 1024;
  if (!isMobileDevice() && !isTabletDevice() && !isSmallScreen) return;

  document.getElementById('touch-controls').classList.add('show');

  // ── Virtual joystick ─────────────────────────────
  const zone  = document.getElementById('joystick-zone');
  const base  = document.getElementById('joystick-base');
  const thumb = document.getElementById('joystick-thumb');
  const MAX_R = 42;
  let   active = false;

  function applyJoystick(cx, cy) {
    const r = base.getBoundingClientRect();
    let dx  = cx - (r.left + r.width  / 2);
    let dy  = cy - (r.top  + r.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MAX_R) { dx = dx / dist * MAX_R; dy = dy / dist * MAX_R; }
    controls.jx = dx / MAX_R;
    controls.jy = dy / MAX_R;
    thumb.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  function releaseJoystick() {
    active = false;
    controls.jx = 0; controls.jy = 0;
    thumb.style.transform = 'translate(-50%, -50%)';
  }

  zone.addEventListener('touchstart',  (e) => { e.preventDefault(); active = true; applyJoystick(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }, { passive: false });
  zone.addEventListener('touchmove',   (e) => { e.preventDefault(); if (active) applyJoystick(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }, { passive: false });
  zone.addEventListener('touchend',    (e) => { e.preventDefault(); releaseJoystick(); });
  zone.addEventListener('touchcancel', (e) => { e.preventDefault(); releaseJoystick(); });
  // Mouse fallback for desktop testing
  zone.addEventListener('mousedown', (e) => { active = true; applyJoystick(e.clientX, e.clientY); });
  document.addEventListener('mousemove', (e) => { if (active) applyJoystick(e.clientX, e.clientY); });
  document.addEventListener('mouseup',   ()  => { if (active) releaseJoystick(); });

  // ── Fire button ──────────────────────────────────
  const fireBtn   = document.getElementById('fire-btn');
  const startFire = () => { if (!controls.spaceHeld) { fireShot(); controls.spaceHeld = true; autoFireTimer = AUTO_FIRE_INTERVAL; } };
  const stopFire  = () => { controls.spaceHeld = false; autoFireTimer = 0; };

  fireBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startFire(); }, { passive: false });
  fireBtn.addEventListener('touchend',   (e) => { e.preventDefault(); stopFire(); });
  fireBtn.addEventListener('mousedown',  startFire);
  fireBtn.addEventListener('mouseup',    stopFire);
}

// ── Intro typewriter ──────────────────────────────────
function showIntro(name, onComplete) {
  const screen = document.getElementById('introscreen');
  const textEl = document.getElementById('intro-text');
  const btn    = document.getElementById('intro-skip-btn');

  screen.classList.add('visible');

  // Story lines — %NAME% replaced with player's name
  const lines = [
    '17 JULY 2027 — 03:47 UTC',
        '',
        'The asteroids came without warning.',
        'They fell toward Earth like a verdict already written.',
        '',
        'Mumbai holds its breath. 2.2 crore souls.',
        'From Bandra\'s glittering towers to Dharavi\'s beating heart,',
        'everyone looks up. Everyone prays.',
        '',
        'You are %NAME%. A pilot. A name barely remembered.',
        'Your spaceship—the only shield between the city and oblivion.',
        '',
        'But REMEMBER in this kind of situation, you might have intent, but time is cruel. Time is the enemy.',
        '',
        'The asteroids never stop.',
        'Can you?',
  ];

  const fullText = lines.join('\n');
  let i = 0;
  let built = '';

  // Cursor element
  const cursor = document.createElement('span');
  cursor.className = 'intro-cursor';

  function type() {
    if (i < fullText.length) {
      built += fullText[i++];
      // Render with name highlighted
      const display = built.replace('%NAME%', `<span class="pilot-name">${name}</span>`);
      textEl.innerHTML = display;
      textEl.appendChild(cursor);
      const delay = fullText[i - 1] === '\n' ? 150 : 32;
      setTimeout(type, delay);
    } else {
      // Typing done — show launch button
      cursor.remove();
      btn.style.display = 'block';
    }
  }

  // Start typing after a brief pause
  setTimeout(type, 600);

  // Launch button
  btn.addEventListener('click', () => {
    screen.style.opacity    = '0';
    screen.style.transition = 'opacity 0.5s ease';
    setTimeout(() => { screen.classList.remove('visible'); screen.style.opacity = ''; }, 500);
    onComplete();
  });

  // Also allow any key to skip/launch after typing starts
  document.addEventListener('keydown', function skipHandler(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      document.removeEventListener('keydown', skipHandler);
      btn.click();
    }
  });
}

// ── Entry point ───────────────────────────────────────
function startGame() {
  const input = document.getElementById('player-name');
  const name  = input.value.trim();
  playerName  = name.length > 0 ? name : "Pilot";

  // Save player name to localStorage
  if (playerName !== "Pilot") {
    localStorage.setItem('bombay_asteroids_player_name', playerName);
  }

  // Unlock AudioContext + start music — must happen inside a user-gesture handler
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  initMusic();

  const screen = document.getElementById('startscreen');
  screen.style.opacity    = '0';
  screen.style.transition = 'opacity 0.4s ease';
  setTimeout(() => { screen.style.display = 'none'; }, 400);

  // Show cinematic intro only on first-ever visit, then launch game directly
  const hasSeenIntro = localStorage.getItem('bombay_asteroids_seen_intro');
  setTimeout(() => {
    if (!hasSeenIntro) {
      localStorage.setItem('bombay_asteroids_seen_intro', '1');
      showIntro(playerName, launchGame);
    } else {
      launchGame();
    }
  }, 450);
}

function launchGame() {
  document.addEventListener('keydown', keypressHandler);
  document.addEventListener('keyup',   keypressHandler);

  // Cache DOM refs once — avoids getElementById every frame
  _elNumber        = document.getElementById('number');
  _elHealthbar     = document.getElementById('healthbar');
  _elLevelIndicator = document.getElementById('level-indicator');
  _elTimerNumber   = document.getElementById('timer-number');
  _elTimer         = document.getElementById('timer');

  initMap();
  map.whenReady(() => {
    initAsteroidPool();  // Pre-allocate asteroid markers
    initShip();
    levelTimer = getLevelConfig(0).timeLimit;
    for (let i = 0; i < getLevelConfig(0).count; i++) spawnAsteroid();
    setInterval(spawnHealth,    15000);   // health drop every 15 s
    setInterval(spawnTimeBoost, 22000);   // time boost every 22 s
    setInterval(spawnShield,    35000);   // shield drop every 35 s
    _startMapDrift();
    requestAnimationFrame(tick);
  });
}

window.addEventListener('load', () => {
  setupTouchControls();
  document.getElementById('version').textContent       = VERSION;
  document.getElementById('start-version').textContent = VERSION;

  const btn   = document.getElementById('start-btn');
  const input = document.getElementById('player-name');

  // Load saved player name from localStorage
  const savedName = localStorage.getItem('bombay_asteroids_player_name');
  if (savedName) {
    input.value = savedName;
  }

  btn.addEventListener('click', startGame);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') startGame(); });
  input.focus();

  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    if (map) map.invalidateSize();
  });
});
