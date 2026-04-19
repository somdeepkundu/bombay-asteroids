// ─────────────────────────────────────────────────────
//  Bombay Asteroids — Smooth Flight Edition
//  Fully self-contained build: graphics and logic.
// ─────────────────────────────────────────────────────

const VERSION = "v2.2.9.3";

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

// ── Map Tile Preloader (The "Smoothness" Engine) ──────────
function preloadWaypointTiles() {
  const template = 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
  const lon2tile = (lon, z) => Math.floor((lon + 180) / 360 * Math.pow(2, z));
  const lat2tile = (lat, z) => Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));

  const tileUrls = new Set();
  MUMBAI_WAYPOINTS.forEach(wp => {
    [13, 15].forEach(z => {
      const cx = lon2tile(wp.lng, z), cy = lat2tile(wp.lat, z);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          tileUrls.add(template.replace('{z}', z).replace('{x}', cx + dx).replace('{y}', cy + dy));
        }
      }
    });
  });
  tileUrls.forEach(url => { const img = new Image(); img.src = url; });
  console.log(`🚀 Cached ${tileUrls.size} tiles for lag-free flight.`);
}

// ── Leaderboard API ──────────────────────────────────
const LEADERBOARD_API = 'https://bombay-asteroids-1028845604936.europe-west1.run.app';

const EXPLOSION_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><circle cx='30' cy='30' r='28' fill='%23ff7b00' opacity='0.7'/><circle cx='30' cy='30' r='18' fill='%23ffd60a' opacity='0.9'/><circle cx='30' cy='30' r='9' fill='%23ffffff' opacity='0.95'/><polygon points='30,0 34,24 58,30 34,36 30,60 26,36 2,30 26,24' fill='%23ff006e' opacity='0.55'/></svg>`;
const HEALTH_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='5' fill='%23001a00' opacity='0.7'/><path d='M19 10.5H13.5V5H10.5V10.5H5V13.5H10.5V19H13.5V13.5H19V10.5Z' fill='%2339ff14'/></svg>`;
const TIMEBOOST_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230a0a2e' opacity='0.9'/><circle cx='14' cy='19' r='9' fill='none' stroke='%2300fff5' stroke-width='2'/><line x1='14' y1='15' x2='14' y2='19' stroke='%2300fff5' stroke-width='2.5' stroke-linecap='round'/><line x1='14' y1='19' x2='17' y2='21' stroke='%2300fff5' stroke-width='2.5' stroke-linecap='round'/><line x1='26' y1='8' x2='26' y2='14' stroke='%2300fff5' stroke-width='2.5' stroke-linecap='round'/><line x1='23' y1='11' x2='29' y2='11' stroke='%2300fff5' stroke-width='2.5' stroke-linecap='round'/></svg>`;
const SHIELD_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230a0a2e' opacity='0.9'/><path d='M16 4 L26 8 L26 17 C26 22 21 26 16 28 C11 26 6 22 6 17 L6 8 Z' fill='none' stroke='%2300b4ff' stroke-width='2.2'/><path d='M16 9 L22 12 L22 18 C22 21 19 23 16 24.5 C13 23 10 21 10 18 L10 12 Z' fill='%2300b4ff' opacity='0.25'/></svg>`;

const ASSETS = {
  spaceship: 'assets/graphics/spaceship_full.svg',
  asteroid1: 'assets/graphics/asteroid1.svg',
  asteroid2: 'assets/graphics/asteroid2.svg',
  shot:      'assets/graphics/green_projectile.svg',
  explosion: 'assets/graphics/explosion.svg',
};

// ── Audio system ──
let audioCtx = null, soundMuted = false, _lastLaser = 0;
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
  if (now - _lastLaser < 0.08) return;
  _lastLaser = now;
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.type = 'square'; osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.14);
  g.gain.setValueAtTime(0.22, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
  osc.start(now); osc.stop(now + 0.14);
}
function playExplosion() {
  if (soundMuted) return;
  const ctx = _ctx(), now = ctx.currentTime;
  const len = Math.floor(ctx.sampleRate * 0.45);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf;
  const flt = ctx.createBiquadFilter(); flt.type = 'lowpass';
  flt.frequency.setValueAtTime(500, now);
  flt.frequency.exponentialRampToValueAtTime(60, now + 0.45);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.5, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
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
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.28, t + 0.02);
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
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + 0.02);
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
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    osc.start(t); osc.stop(t + 0.24);
  });
}

// ── Difficulty logic ──
const _lvlCfgCache = new Map();
function getLevelConfig(lvl) {
  if (_lvlCfgCache.has(lvl)) return _lvlCfgCache.get(lvl);
  const cfg = {
    count: Math.min(3 + lvl * 2, 16),
    speedMin: 50 + lvl * 15,
    speedMax: Math.min(100 + lvl * 28, 280),
    vxMax: Math.max(0, Math.min((lvl - 2) * 65, 200)),
    timeLimit: Math.max(10, 52 - lvl * 4),
    label: 'LEVEL ' + (lvl + 1),
    hasLock: lvl >= 3,
  };
  _lvlCfgCache.set(lvl, cfg);
  return cfg;
}
function scoreToReachLevel(lvl) {
  let s = 0;
  for (let i = 0; i < lvl; i++) s += 50 + i * 40;
  return s;
}

// ── Globals ──
let currentLevel = 0, levelTimer = 0, breathTime = 0, flyingTo = false;
let driftAngle = Math.PI / 2, driftAngleTarget = Math.PI / 2, driftChangeTimer = 0;
let map, W, H, shipMarker, playerName = "Player";
let autoFireTimer = 0;
const AUTO_FIRE_INTERVAL = 0.18;
let lockAxis = null, lockState = 'none', lockTimer = 0, lockWarnTimer = 0, lockScheduleTimeout = null;

function scheduleLock() {
  if (gameOver || lockState !== 'none' || !getLevelConfig(currentLevel).hasLock) return;
  if (lockScheduleTimeout) clearTimeout(lockScheduleTimeout);
  lockScheduleTimeout = setTimeout(() => {
    lockScheduleTimeout = null;
    if (!gameOver && lockState === 'none') startLockWarning();
  }, 10000 + Math.random() * 10000);
}
function startLockWarning() {
  lockAxis = Math.random() < 0.5 ? 'x' : 'y';
  lockState = 'warning'; lockWarnTimer = 5; updateLockUI();
}
function updateLockUI() {
  const el = document.getElementById('lock-warning');
  if (!el) return;
  if (lockState === 'warning') {
    el.className = 'warn'; el.textContent = `⚠ ${lockAxis === 'x' ? 'ROLL' : 'PITCH'} LOCK IN ${Math.ceil(lockWarnTimer)}`;
    el.style.display = 'block';
  } else if (lockState === 'locked') {
    el.className = 'locked'; el.textContent = `⛔ ${lockAxis === 'x' ? 'ROLL' : 'PITCH'} LOCKED — ${Math.ceil(lockTimer)}s`;
    el.style.display = 'block';
  } else el.style.display = 'none';
}

function initMap() {
  W = window.innerWidth; H = window.innerHeight;
  const mapEl = document.getElementById('map');
  if (mapEl) { mapEl.style.transformOrigin = '50% 50%'; mapEl.style.willChange = 'transform'; }
  const start = waypointFor(0);
  map = L.map('map', {
    center: [start.lat, start.lng], zoom: 15, zoomControl: false, attributionControl: true,
    dragging: false, touchZoom: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false,
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 20,
    keepBuffer: 6, updateWhenZooming: false
  }).addTo(map);
}

function px(x, y) { return map.containerPointToLatLng(L.point(x, y)); }

const controls = { up: false, down: false, left: false, right: false, spaceHeld: false, jx: 0, jy: 0 };
function keypressHandler(e) {
  const v = e.type === 'keydown';
  if (['a','ArrowLeft'].includes(e.key)) { controls.left = v; e.preventDefault(); }
  if (['w','ArrowUp'].includes(e.key))   { controls.up = v; e.preventDefault(); }
  if (['s','ArrowDown'].includes(e.key)) { controls.down = v; e.preventDefault(); }
  if (['d','ArrowRight'].includes(e.key)){ controls.right = v; e.preventDefault(); }
  if (v && (e.key.toLowerCase() === 'm')) toggleMute();
  if (v && (e.key.toLowerCase() === 'p' || e.key === 'Escape')) togglePause();
  if (e.key === ' ') {
    e.preventDefault();
    if (v && !controls.spaceHeld) { fireShot(); controls.spaceHeld = true; autoFireTimer = AUTO_FIRE_INTERVAL; }
    if (!v) { controls.spaceHeld = false; autoFireTimer = 0; }
  }
}

const ship = { x: 0, y: 0, s: 300, w: 60, h: 80, hl: 100 };
function initShip() {
  ship.x = W / 2; ship.y = H * 0.75;
  shipMarker = L.marker(px(ship.x, ship.y), {
    icon: L.divIcon({ className: '', html: `<img src="${ASSETS.spaceship}" width="60" height="80" style="display:block;filter:drop-shadow(0 0 10px rgba(0,255,245,0.8))">`, iconSize: [60, 80], iconAnchor: [30, 40] }),
    interactive: false, zIndexOffset: 500
  }).addTo(map);
}

function moveShip(dt) {
  const canX = !(lockState === 'locked' && lockAxis === 'x');
  const canY = !(lockState === 'locked' && lockAxis === 'y');
  if (canX) {
    if (controls.left && ship.x > ship.w / 2) ship.x -= ship.s * dt;
    if (controls.right && ship.x < W - ship.w / 2) ship.x += ship.s * dt;
    if (controls.jx !== 0) ship.x = Math.max(ship.w/2, Math.min(W - ship.w/2, ship.x + controls.jx * ship.s * dt));
  }
  if (canY) {
    if (controls.up && ship.y > ship.h / 2) ship.y -= ship.s * dt;
    if (controls.down && ship.y < H - ship.h / 2) ship.y += ship.s * dt;
    if (controls.jy !== 0) ship.y = Math.max(ship.h/2, Math.min(H - ship.h/2, ship.y + controls.jy * ship.s * dt));
  }
}

// ── Asteroids & Powerups ──
const asteroids = [], powerups = [], shots = [];

function spawnAsteroid(opts = {}) {
  const src = Math.random() < 0.5 ? ASSETS.asteroid1 : ASSETS.asteroid2;
  const lvl = getLevelConfig(currentLevel);
  const size = opts.size || 'large', dim = size === 'large' ? 50 : 28;
  const obj = {
    x: opts.x ?? Math.random() * W, y: opts.y ?? -30, w: dim, h: dim, size,
    s: opts.s ?? Math.random() * (lvl.speedMax - lvl.speedMin) + lvl.speedMin,
    vx: opts.vx ?? (Math.random() * 2 - 1) * lvl.vxMax
  };
  obj.marker = L.marker(px(obj.x, obj.y), { icon: L.divIcon({ className: '', html: `<img src="${src}" width="${dim}" height="${dim}" class="asteroid-spin">`, iconSize: [dim, dim], iconAnchor: [dim/2, dim/2] }), interactive: false }).addTo(map);
  asteroids.push(obj);
}

function moveAsteroids(dt) {
  for (const a of asteroids) {
    a.y += a.s * dt; a.x += a.vx * dt;
    if (a.y > H + 30 || a.x < -60 || a.x > W + 60) {
      a.y = -30; a.x = Math.random() * W;
      const lvl = getLevelConfig(currentLevel);
      a.s = Math.random() * (lvl.speedMax - lvl.speedMin) + lvl.speedMin;
      a.vx = (Math.random() * 2 - 1) * lvl.vxMax;
    }
  }
}

function spawnHealth() { _spawnPowerup('health', HEALTH_SVG, 'health-pulse', 'rgba(57,255,20,0.9)', 80); }
function spawnTimeBoost() { _spawnPowerup('time', TIMEBOOST_SVG, 'timeboost-pulse', 'rgba(0,255,245,0.9)', 70); }
function spawnShield() { _spawnPowerup('shield', SHIELD_SVG, 'shield-pulse', 'rgba(0,180,255,0.9)', 60); }

function _spawnPowerup(type, svg, cls, color, speed) {
  if (gameOver) return;
  const obj = { x: Math.random() * (W - 60) + 30, y: -30, w: 34, h: 34, s: speed, type };
  obj.marker = L.marker(px(obj.x, obj.y), { icon: L.divIcon({ className: '', html: `<img src="${svg}" width="34" height="34" class="${cls}" style="filter:drop-shadow(0 0 10px ${color})">`, iconSize: [34, 34], iconAnchor: [17, 17] }), interactive: false, zIndexOffset: 400 }).addTo(map);
  powerups.push(obj);
}

function movePowerups(dt) {
  for (let i = powerups.length - 1; i >= 0; i--) {
    powerups[i].y += powerups[i].s * dt;
    if (powerups[i].y > H + 30) { map.removeLayer(powerups[i].marker); powerups.splice(i, 1); }
  }
}

function fireShot() {
  const obj = { x: ship.x, y: ship.y - ship.h / 2, w: 20, h: 30, s: 450 };
  obj.marker = L.marker(px(obj.x, obj.y), { icon: L.divIcon({ className: '', html: `<img src="${ASSETS.shot}" width="20" height="30">`, iconSize: [20, 30], iconAnchor: [10, 15] }), interactive: false }).addTo(map);
  shots.push(obj); playLaser();
}

function moveShots(dt) {
  for (let i = shots.length - 1; i >= 0; i--) {
    shots[i].y -= shots[i].s * dt;
    if (shots[i].y < -30) { map.removeLayer(shots[i].marker); shots.splice(i, 1); }
  }
}

function explodeAt(x, y) {
  const m = L.marker(px(x, y), { icon: L.divIcon({ className: '', html: `<img src="${EXPLOSION_SVG}" width="60" height="60" class="explode-anim">`, iconSize: [60, 60], iconAnchor: [30, 30] }), interactive: false }).addTo(map);
  setTimeout(() => map.removeLayer(m), 500); playExplosion();
}

function isColliding(a, b) { return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2) < (a.w/2 + b.w/2); }

function render() {
  shipMarker.setLatLng(px(ship.x, ship.y));
  asteroids.forEach(a => a.marker.setLatLng(px(a.x, a.y)));
  shots.forEach(s => s.marker.setLatLng(px(s.x, s.y)));
  powerups.forEach(p => p.marker.setLatLng(px(p.x, p.y)));
  document.getElementById('number').textContent = String(points).padStart(3, '0');
  document.getElementById('healthbar').style.width = `${Math.max(ship.hl, 0)}%`;
  document.getElementById('level-indicator').textContent = getLevelConfig(currentLevel).label;
  const secs = Math.ceil(Math.max(levelTimer, 0));
  const tEl = document.getElementById('timer-number');
  tEl.textContent = secs; tEl.parentElement.classList.toggle('urgent', secs <= 10);
}

// ── Smooth Map Dynamics ──
function driftMap(dt) {
  if (!map || flyingTo) return;
  driftChangeTimer -= dt;
  if (driftChangeTimer <= 0) { driftAngleTarget = Math.random() * Math.PI * 2; driftChangeTimer = 7 + Math.random() * 5; }
  let delta = driftAngleTarget - driftAngle;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  driftAngle += delta * Math.min(1, dt * 0.4);
  const distance = (18 + currentLevel * 4) * dt;
  map.panBy([Math.cos(driftAngle) * distance, Math.sin(driftAngle) * distance], { animate: false, noMoveStart: true });
}

function tickBreath(dt) {
  const el = document.getElementById('map'); if (!el) return;
  breathTime += dt;
  el.style.transform = `scale(${ (1 + Math.sin(breathTime * 0.35) * 0.015).toFixed(4) })`;
}

function flyToWaypoint(level) {
  if (!map) return;
  const wp = waypointFor(level); flyingTo = true;
  map.flyTo([wp.lat, wp.lng], 13, { duration: 2.8, easeLinearity: 0.15 });
  map.once('moveend', () => {
    map.flyTo([wp.lat, wp.lng], 15, { duration: 2.6, easeLinearity: 0.15 });
    map.once('moveend', () => { flyingTo = false; });
  });
}

function levelUp(newIdx) {
  currentLevel = newIdx; const lvl = getLevelConfig(currentLevel);
  levelTimer = lvl.timeLimit; showLevelBanner(lvl.label); playLevelUp();
  if (lvl.hasLock) scheduleLock();
  flyToWaypoint(newIdx);
}

// ── Game Loop ──
let points = 0, gameOver = false, lastTime = 0, paused = false, pauseUsed = false, shipShielded = false, shieldTimer = 0;
let personalBest = parseInt(localStorage.getItem('bombay_asteroids_best') || '0');

function tick(ts) {
  if (gameOver || paused) return;
  requestAnimationFrame(tick);
  if (lastTime === 0) { lastTime = ts; return; }
  const dt = Math.min((ts - lastTime) / 1000, 0.1); lastTime = ts;
  levelTimer -= dt; if (levelTimer <= 0) { endGame("TIME'S UP"); return; }
  if (shipShielded) { shieldTimer -= dt; if (shieldTimer <= 0) { shipShielded = false; updateShieldGlow(false); } }

  if (lockState === 'warning') { lockWarnTimer -= dt; updateLockUI(); if (lockWarnTimer <= 0) { lockState = 'locked'; lockTimer = 6; updateLockUI(); } }
  else if (lockState === 'locked') { lockTimer -= dt; updateLockUI(); if (lockTimer <= 0) { lockState = 'none'; lockAxis = null; updateLockUI(); scheduleLock(); } }

  if (currentLevel >= 9 && controls.spaceHeld) { autoFireTimer -= dt; if (autoFireTimer <= 0) { fireShot(); autoFireTimer = AUTO_FIRE_INTERVAL; } }

  moveShip(dt); moveAsteroids(dt); moveShots(dt); movePowerups(dt); driftMap(dt); tickBreath(dt);
  if (getLevelIndex(points) > currentLevel) levelUp(getLevelIndex(points));

  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i]; if (!isColliding(p, ship)) continue;
    if (p.type === 'health') { ship.hl = Math.min(100, ship.hl + 40); playHealthPickup(); }
    else if (p.type === 'time') { levelTimer += 12; playTimePickup(); }
    else if (p.type === 'shield') { shipShielded = true; shieldTimer = 5; updateShieldGlow(true); playHealthPickup(); }
    map.removeLayer(p.marker); powerups.splice(i, 1);
  }

  for (const a of asteroids) {
    if (!isColliding(a, ship)) continue;
    if (!shipShielded) { ship.hl -= 20 * dt; playExplosion(); if (ship.hl <= 0) { endGame("HULL BREACH"); return; } }
  }

  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const a = asteroids[j]; if (!isColliding(s, a)) continue;
      points += a.size === 'large' ? 20 : 15; explodeAt(a.x, a.y);
      map.removeLayer(a.marker); asteroids.splice(j, 1);
      map.removeLayer(s.marker); shots.splice(i, 1); break;
    }
  }
  while (asteroids.length < getLevelConfig(currentLevel).count) spawnAsteroid();
  render();
}

function getLevelIndex(score) { let l = 0; while (scoreToReachLevel(l + 1) <= score) l++; return l; }
function updateShieldGlow(on) { if (!shipMarker) return; shipMarker.getElement().querySelector('img').style.filter = on ? 'drop-shadow(0 0 18px #00b4ff)' : 'drop-shadow(0 0 10px rgba(0,255,245,0.8))'; }
function togglePause() {
  if (gameOver || (paused && pauseUsed)) return;
  paused = !paused;
  if (paused) { pauseUsed = true; document.getElementById('pause-overlay').style.display = 'flex'; }
  else { lastTime = 0; document.getElementById('pause-overlay').style.display = 'none'; requestAnimationFrame(tick); }
}

const LEVEL_HINTS = { 2: '☄️ Faster...', 3: '↙️ Drifting...', 4: '🔒 Locked!', 7: '⚡ No mercy' };
function showLevelBanner(label) {
  const el = document.createElement('div'); el.id = 'level-transition';
  el.innerHTML = `<div class="lt-inner"><div class="lt-tag">LEVEL UP</div><div class="lt-name">${label}</div><div class="lt-hint">${LEVEL_HINTS[currentLevel] || '🛸 Focus'}</div></div>`;
  document.body.appendChild(el);
  setTimeout(() => { el.classList.add('lt-fade'); setTimeout(() => el.remove(), 350); }, 1400);
}

function endGame(reason) {
  gameOver = true; if (points > personalBest) localStorage.setItem('bombay_asteroids_best', points);
  saveToLeaderboard(playerName, points);
  const div = document.createElement('div'); div.id = 'gameover';
  div.innerHTML = `<div class="gameover-title">${reason}</div><div class="gameover-player">${playerName} — ${points} pts</div><button class="restart-btn" onclick="location.reload()">RETRY</button>`;
  document.body.appendChild(div);
}

async function saveToLeaderboard(name, score) { try { await fetch(`${LEADERBOARD_API}/api/score`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, score, version: VERSION, level: currentLevel + 1 }) }); } catch(e){} }

function startGame() {
  playerName = document.getElementById('player-name').value.trim() || "Pilot";
  localStorage.setItem('bombay_asteroids_player_name', playerName);
  preloadWaypointTiles();
  document.getElementById('startscreen').style.display = 'none';
  launchGame();
}

function launchGame() {
  document.addEventListener('keydown', keypressHandler); document.addEventListener('keyup', keypressHandler);
  initMap(); map.whenReady(() => {
    initShip(); levelTimer = getLevelConfig(0).timeLimit;
    for (let i = 0; i < getLevelConfig(0).count; i++) spawnAsteroid();
    setInterval(spawnHealth, 15000); setInterval(spawnTimeBoost, 22000); setInterval(spawnShield, 35000);
    requestAnimationFrame(tick);
  });
}

window.addEventListener('load', () => {
  document.getElementById('start-btn').addEventListener('click', startGame);
  const saved = localStorage.getItem('bombay_asteroids_player_name');
  if (saved) document.getElementById('player-name').value = saved;
});
