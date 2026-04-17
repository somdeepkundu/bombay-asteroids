// ─────────────────────────────────────────────────────
//  Bombay Asteroids  —  fully self-contained build
//  All graphics are inline SVG data-URIs; no external
//  asset folder required.
// ─────────────────────────────────────────────────────

const VERSION = "v2.1.0";

const EXPLOSION_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><circle cx='30' cy='30' r='28' fill='%23ff7b00' opacity='0.7'/><circle cx='30' cy='30' r='18' fill='%23ffd60a' opacity='0.9'/><circle cx='30' cy='30' r='9' fill='%23ffffff' opacity='0.95'/><polygon points='30,0 34,24 58,30 34,36 30,60 26,36 2,30 26,24' fill='%23ff006e' opacity='0.55'/></svg>`;

const HEALTH_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='5' fill='%23001a00' opacity='0.7'/><path d='M19 10.5H13.5V5H10.5V10.5H5V13.5H10.5V19H13.5V13.5H19V10.5Z' fill='%2339ff14'/></svg>`;

// Clock face + "+" symbol (time booster)
const TIMEBOOST_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230a0a2e' opacity='0.9'/><circle cx='14' cy='19' r='9' fill='none' stroke='%2300fff5' stroke-width='2'/><line x1='14' y1='15' x2='14' y2='19' stroke='%2300fff5' stroke-width='2.5' stroke-linecap='round'/><line x1='14' y1='19' x2='17' y2='21' stroke='%2300fff5' stroke-width='2.5' stroke-linecap='round'/><line x1='26' y1='8' x2='26' y2='14' stroke='%2300fff5' stroke-width='2.5' stroke-linecap='round'/><line x1='23' y1='11' x2='29' y2='11' stroke='%2300fff5' stroke-width='2.5' stroke-linecap='round'/></svg>`;

// Asset paths (real SVG files)
const ASSETS = {
  spaceship: 'assets/graphics/spaceship_full.svg',
  asteroid1: 'assets/graphics/asteroid1.svg',
  asteroid2: 'assets/graphics/asteroid2.svg',
  shot:      'assets/graphics/green_projectile.svg',
  explosion: 'assets/graphics/explosion.svg',
};

// ── Infinite procedural difficulty ───────────────────
function getLevelConfig(lvl) {
  return {
    count:     Math.min(3 + lvl * 2, 16),
    speedMin:  50  + lvl * 15,
    speedMax:  Math.min(100 + lvl * 28, 280),
    vxMax:     Math.max(0, Math.min((lvl - 2) * 65, 200)),
    timeLimit: Math.max(10, 52 - lvl * 4),
    label:     'LEVEL ' + (lvl + 1),
    hasLock:   lvl >= 3,           // Roll/Pitch lock active from Level 4+
    hasAutoFire: lvl >= 9,         // Continuous fire from Level 10+
  };
}

function scoreToReachLevel(lvl) {
  let s = 0;
  for (let i = 0; i < lvl; i++) s += 50 + i * 40;
  return s;
}

let currentLevel = 0;
let levelTimer   = 0;
let mapDriftAcc  = 0;
let map, W, H;
let playerName   = "Player";

// ── Auto-fire (Feature 3) ─────────────────────────────
const AUTO_FIRE_INTERVAL = 0.18;  // seconds between continuous shots
let autoFireTimer = 0;

// ── Roll / Pitch lock (Feature 4) ────────────────────
// lockAxis: null | 'x' (roll) | 'y' (pitch)
// lockState: 'none' | 'warning' | 'locked'
let lockAxis          = null;
let lockState         = 'none';
let lockTimer         = 0;
let lockWarnTimer     = 0;
let lockScheduleTO    = null;   // setTimeout handle

function scheduleLock() {
  if (gameOver || lockState !== 'none') return;
  if (!getLevelConfig(currentLevel).hasLock) return;
  if (lockScheduleTO) clearTimeout(lockScheduleTO);
  const delay = 12000 + Math.random() * 10000;  // 12-22 s into the level
  lockScheduleTO = setTimeout(() => {
    lockScheduleTO = null;
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
    const name = lockAxis === 'x' ? 'ROLL' : 'PITCH';
    el.className = 'warn';
    el.textContent = `\u26A0 ${name} LOCK IN ${Math.ceil(lockWarnTimer)}`;
    el.style.display = 'block';
  } else if (lockState === 'locked') {
    const name = lockAxis === 'x' ? 'ROLL' : 'PITCH';
    el.className = 'locked';
    el.textContent = `\u26D4 ${name} LOCKED \u2014 ${Math.ceil(lockTimer)}s`;
    el.style.display = 'block';
  } else {
    el.className = '';
    el.style.display = 'none';
  }
}

// ── Map initialisation ───────────────────────────────
function initMap() {
  W = window.innerWidth;
  H = window.innerHeight;

  map = L.map('map', {
    center: [19.133, 72.914],
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

// ── Controls (digital + analog joystick) ─────────────
const controls = {
  up: false, down: false, left: false, right: false,
  spaceHeld: false,
  jx: 0, jy: 0,   // analog joystick: -1..1
};

function keypressHandler(e) {
  const v = e.type === 'keydown';
  if (e.key === 'a' || e.key === 'ArrowLeft')  { controls.left  = v; e.preventDefault(); }
  if (e.key === 'w' || e.key === 'ArrowUp')    { controls.up    = v; e.preventDefault(); }
  if (e.key === 's' || e.key === 'ArrowDown')  { controls.down  = v; e.preventDefault(); }
  if (e.key === 'd' || e.key === 'ArrowRight') { controls.right = v; e.preventDefault(); }
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

// ── Spaceship ────────────────────────────────────────
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
    if (controls.left  && ship.x > ship.w / 2)       ship.x -= ship.s * dt;
    if (controls.right && ship.x < W - ship.w / 2)   ship.x += ship.s * dt;
  }
  if (canY) {
    if (controls.up    && ship.y > ship.h / 2)        ship.y -= ship.s * dt;
    if (controls.down  && ship.y < H - ship.h / 2)   ship.y += ship.s * dt;
  }

  // Analog joystick (proportional speed — faster further from centre)
  if (controls.jx !== 0 || controls.jy !== 0) {
    if (canX) ship.x = Math.max(ship.w / 2,     Math.min(W - ship.w / 2, ship.x + controls.jx * ship.s * dt));
    if (canY) ship.y = Math.max(ship.h / 2,     Math.min(H - ship.h / 2, ship.y + controls.jy * ship.s * dt));
  }
}

// ── Asteroids ────────────────────────────────────────
const asteroids = [];

function spawnAsteroid() {
  const src = Math.random() < 0.5 ? ASSETS.asteroid1 : ASSETS.asteroid2;
  const lvl = getLevelConfig(currentLevel);
  const obj = {
    x:  Math.random() * W,
    y:  -30,
    w:  50, h: 50,
    s:  Math.random() * (lvl.speedMax - lvl.speedMin) + lvl.speedMin,
    vx: (Math.random() * 2 - 1) * lvl.vxMax,
  };
  obj.marker = L.marker(px(obj.x, obj.y), {
    icon: L.divIcon({
      className: '',
      html: `<img src="${src}" width="50" height="50" class="asteroid-spin" style="display:block;filter:drop-shadow(0 0 6px rgba(255,80,80,0.5))">`,
      iconSize: [50, 50],
      iconAnchor: [25, 25],
    }),
    interactive: false,
  }).addTo(map);
  asteroids.push(obj);
}

function moveAsteroids(dt) {
  for (const a of asteroids) {
    a.y += a.s * dt;
    a.x += a.vx * dt;
    if (a.y > H + 30 || a.x < -60 || a.x > W + 60) resetAsteroid(a);
  }
}

function resetAsteroid(a) {
  a.y = -30;
  a.x = Math.random() * W;
  const lvl = getLevelConfig(currentLevel);
  a.s  = Math.random() * (lvl.speedMax - lvl.speedMin) + lvl.speedMin;
  a.vx = (Math.random() * 2 - 1) * lvl.vxMax;
}

// ── Powerups: health + time boost (Feature 1) ────────
const powerups = [];

function spawnHealth() {
  if (gameOver) return;
  _spawnPowerup('health', HEALTH_SVG, 'health-pulse',
    'rgba(57,255,20,0.9)', 'rgba(57,255,20,0.5)', 80);
}

function spawnTimeBoost() {
  if (gameOver) return;
  _spawnPowerup('time', TIMEBOOST_SVG, 'timeboost-pulse',
    'rgba(0,255,245,0.9)', 'rgba(0,255,245,0.5)', 70);
}

function _spawnPowerup(type, svg, cssClass, glow1, glow2, speed) {
  const obj = {
    x: Math.random() * (W - 60) + 30,
    y: -30,
    w: 34, h: 34,
    s: speed,
    type,
  };
  obj.marker = L.marker(px(obj.x, obj.y), {
    icon: L.divIcon({
      className: '',
      html: `<img src="${svg}" width="34" height="34" class="${cssClass}" style="display:block;filter:drop-shadow(0 0 10px ${glow1}) drop-shadow(0 0 20px ${glow2})">`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    }),
    interactive: false,
    zIndexOffset: 400,
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

// ── Shots ────────────────────────────────────────────
const shots = [];

function fireShot() {
  const obj = { x: ship.x, y: ship.y - ship.h / 2, w: 20, h: 30, s: 450 };
  obj.marker = L.marker(px(obj.x, obj.y), {
    icon: L.divIcon({
      className: '',
      html: `<img src="${ASSETS.shot}" width="20" height="30" style="display:block;filter:drop-shadow(0 0 8px rgba(57,255,20,0.95)) drop-shadow(0 0 18px rgba(57,255,20,0.5))">`,
      iconSize: [20, 30],
      iconAnchor: [10, 15],
    }),
    interactive: false,
    zIndexOffset: 200,
  }).addTo(map);
  shots.push(obj);
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
      iconSize: [60, 60],
      iconAnchor: [30, 30],
    }),
    interactive: false,
    zIndexOffset: 300,
  }).addTo(map);
  setTimeout(() => map.removeLayer(m), 500);
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

  document.getElementById('number').textContent = String(points).padStart(3, '0');
  document.getElementById('healthbar').style.width = `${Math.max(ship.hl, 0)}%`;
  document.getElementById('level-indicator').textContent = getLevelConfig(currentLevel).label;
  const secs    = Math.ceil(Math.max(levelTimer, 0));
  const timerEl = document.getElementById('timer-number');
  timerEl.textContent = secs;
  timerEl.parentElement.classList.toggle('urgent', secs <= 10);
}

// ── Difficulty progression ────────────────────────────
function getLevelIndex(score) {
  let lvl = 0;
  while (scoreToReachLevel(lvl + 1) <= score) lvl++;
  return lvl;
}

function levelUp(newIdx) {
  currentLevel = newIdx;
  const lvl    = getLevelConfig(currentLevel);
  levelTimer   = lvl.timeLimit;
  while (asteroids.length < lvl.count) spawnAsteroid();
  showLevelBanner(lvl.label);

  // Reset lock state for the new level and schedule fresh lock if eligible
  if (lockScheduleTO) { clearTimeout(lockScheduleTO); lockScheduleTO = null; }
  lockState = 'none'; lockAxis = null; updateLockUI();
  if (lvl.hasLock) scheduleLock();

  // Announce auto-fire unlock on first eligible level
  if (lvl.hasAutoFire && newIdx === 9) showNotice('AUTO-FIRE UNLOCKED \u2014 HOLD TO FIRE');
}

function showLevelBanner(label) {
  const el = document.createElement('div');
  el.className = 'level-banner';
  el.textContent = label;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 600); }, 1600);
}

function showNotice(text) {
  const el = document.createElement('div');
  el.className = 'game-notice';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 700); }, 2200);
}

// ── Map parallax drift ────────────────────────────────
function driftMap(dt) {
  if (!map) return;
  const speed = 18 + currentLevel * 4;
  mapDriftAcc += speed * dt;
  if (mapDriftAcc >= 1) {
    const dy = Math.floor(mapDriftAcc);
    map.panBy([0, dy], { animate: false, noMoveStart: true });
    mapDriftAcc -= dy;
  }
}

// ── Game loop ─────────────────────────────────────────
let points = 0, gameOver = false, lastTime = 0;

function tick(ts) {
  if (gameOver) return;
  requestAnimationFrame(tick);

  if (lastTime === 0) { lastTime = ts; return; }
  const dt   = Math.min((ts - lastTime) / 1000, 0.1);
  lastTime   = ts;

  levelTimer -= dt;
  if (levelTimer <= 0) { endGame("TIME'S UP"); return; }

  // ── Lock state machine (Feature 4) ────────────────
  if (lockState === 'warning') {
    lockWarnTimer -= dt;
    updateLockUI();
    if (lockWarnTimer <= 0) { lockState = 'locked'; lockTimer = 6; updateLockUI(); }
  } else if (lockState === 'locked') {
    lockTimer -= dt;
    updateLockUI();
    if (lockTimer <= 0) {
      lockState = 'none'; lockAxis = null; updateLockUI();
      scheduleLock();   // one more lock per level after the first ends
    }
  }

  moveShip(dt);
  moveAsteroids(dt);
  moveShots(dt);
  movePowerups(dt);
  driftMap(dt);

  // ── Continuous fire at Level 10+ (Feature 3) ──────
  if (getLevelConfig(currentLevel).hasAutoFire && controls.spaceHeld) {
    autoFireTimer -= dt;
    if (autoFireTimer <= 0) { fireShot(); autoFireTimer = AUTO_FIRE_INTERVAL; }
  }

  // Check level up
  const newLevel = getLevelIndex(points);
  if (newLevel > currentLevel) levelUp(newLevel);

  // Powerup ↔ ship
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    if (isColliding(p, ship)) {
      if (p.type === 'health') {
        ship.hl = Math.min(100, ship.hl + 40);
      } else if (p.type === 'time') {
        // Add 12 s, but cap at original time limit + 12 to avoid huge grants
        levelTimer = Math.min(levelTimer + 12, getLevelConfig(currentLevel).timeLimit + 12);
        flashTimer();
      }
      map.removeLayer(p.marker);
      powerups.splice(i, 1);
      break;
    }
  }

  // Asteroid ↔ ship
  for (const a of asteroids) {
    if (isColliding(a, ship)) {
      a.s *= 0.95;
      ship.hl -= 20 * dt;
      if (ship.hl <= 0) { endGame("HULL BREACH"); return; }
    }
  }

  // Shot ↔ asteroid
  for (let i = shots.length - 1; i >= 0; i--) {
    const shot = shots[i];
    for (const a of asteroids) {
      if (isColliding(shot, a)) {
        points += 10;
        explodeAt(a.x, a.y);
        resetAsteroid(a);
        removeShot(shot);
        break;
      }
    }
  }

  render();
}

function flashTimer() {
  const el = document.getElementById('timer');
  if (!el) return;
  el.classList.add('time-gained');
  setTimeout(() => el.classList.remove('time-gained'), 900);
}

// ── Game over ─────────────────────────────────────────
function endGame(reason) {
  gameOver = true;
  const div = document.createElement('div');
  div.id    = 'gameover';
  div.innerHTML = `
    <div class="gameover-title">${reason || 'GAME OVER'}</div>
    <div class="gameover-player">${playerName} &mdash; ${points} pts</div>
    <div class="gameover-level">Reached ${getLevelConfig(currentLevel).label}</div>
    <div class="gameover-credit">Developed by Somdeep Kundu &middot; @RuDRA Lab, C-TARA, IITB</div>
    <div class="gameover-source">learned from &ldquo;Problem Solving with Abstraction&rdquo; by Programming 2.0 (YouTube)</div>
    <button class="restart-btn" onclick="location.reload()">PLAY AGAIN</button>
  `;
  document.body.appendChild(div);
}

// ── Mobile / tablet detection ─────────────────────────
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
function isTabletDevice() {
  return /(iPad|Android)/i.test(navigator.userAgent);
}

// ── Touch controls (Feature 2: analog joystick) ───────
function setupTouchControls() {
  const isMobile    = isMobileDevice();
  const isTablet    = isTabletDevice();
  const isSmallScreen = window.innerWidth < 1024;
  if (!isMobile && !isTablet && !isSmallScreen) return;

  document.getElementById('touch-controls').classList.add('show');

  // ── Virtual joystick ──────────────────────────────
  const zone  = document.getElementById('joystick-zone');
  const base  = document.getElementById('joystick-base');
  const thumb = document.getElementById('joystick-thumb');
  const MAX_R = 42;     // max thumb displacement in px
  let jActive = false;

  function applyJoystick(cx, cy) {
    const r  = base.getBoundingClientRect();
    const bx = r.left + r.width  / 2;
    const by = r.top  + r.height / 2;
    let dx   = cx - bx;
    let dy   = cy - by;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d > MAX_R) { dx = dx / d * MAX_R; dy = dy / d * MAX_R; }
    controls.jx = dx / MAX_R;
    controls.jy = dy / MAX_R;
    thumb.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  function releaseJoystick() {
    jActive = false;
    controls.jx = 0; controls.jy = 0;
    thumb.style.transform = 'translate(-50%, -50%)';
  }

  zone.addEventListener('touchstart',  (e) => { e.preventDefault(); jActive = true; applyJoystick(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }, { passive: false });
  zone.addEventListener('touchmove',   (e) => { e.preventDefault(); if (jActive) applyJoystick(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }, { passive: false });
  zone.addEventListener('touchend',    (e) => { e.preventDefault(); releaseJoystick(); });
  zone.addEventListener('touchcancel', (e) => { e.preventDefault(); releaseJoystick(); });
  // Mouse fallback for desktop testing of touch UI
  zone.addEventListener('mousedown', (e) => { jActive = true; applyJoystick(e.clientX, e.clientY); });
  document.addEventListener('mousemove', (e) => { if (jActive) applyJoystick(e.clientX, e.clientY); });
  document.addEventListener('mouseup',   ()  => { if (jActive) releaseJoystick(); });

  // ── Fire button ───────────────────────────────────
  const fireBtn = document.getElementById('fire-btn');

  function startFire() {
    if (!controls.spaceHeld) {
      fireShot();
      controls.spaceHeld = true;
      autoFireTimer = AUTO_FIRE_INTERVAL;
    }
  }
  function stopFire() { controls.spaceHeld = false; autoFireTimer = 0; }

  fireBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startFire(); }, { passive: false });
  fireBtn.addEventListener('touchend',   (e) => { e.preventDefault(); stopFire();  });
  fireBtn.addEventListener('mousedown',  startFire);
  fireBtn.addEventListener('mouseup',    stopFire);
}

// ── Entry point ───────────────────────────────────────
function startGame() {
  const input  = document.getElementById('player-name');
  const name   = input.value.trim();
  playerName   = name.length > 0 ? name : "Player";

  const screen = document.getElementById('startscreen');
  screen.style.opacity    = '0';
  screen.style.transition = 'opacity 0.4s ease';
  setTimeout(() => { screen.style.display = 'none'; }, 400);

  document.addEventListener('keydown', keypressHandler);
  document.addEventListener('keyup',   keypressHandler);

  initMap();
  map.whenReady(() => {
    initShip();
    levelTimer = getLevelConfig(0).timeLimit;
    for (let i = 0; i < getLevelConfig(0).count; i++) spawnAsteroid();
    setInterval(spawnHealth,    15000);   // health every 15 s
    setInterval(spawnTimeBoost, 22000);   // time boost every 22 s
    requestAnimationFrame(tick);
  });
}

window.addEventListener('load', () => {
  setupTouchControls();
  document.getElementById('version').textContent       = VERSION;
  document.getElementById('start-version').textContent = VERSION;

  const btn   = document.getElementById('start-btn');
  const input = document.getElementById('player-name');
  btn.addEventListener('click', startGame);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') startGame(); });
  input.focus();

  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    if (map) map.invalidateSize();
  });
});
