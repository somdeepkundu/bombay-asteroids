// Shared constants and data utilities for Bombay Asteroids dashboards.
// Imported by dashboard.html and admin/dashboard.html.

const BA_API = 'https://bombay-asteroids-1028845604936.europe-west1.run.app/api/admin?key=';

function getKey()    { return sessionStorage.getItem('ba_admin_key') || ''; }
function promptKey(msg) {
  const k = prompt(msg || 'Enter admin key:');
  if (k) { sessionStorage.setItem('ba_admin_key', k); return k; }
  return null;
}

function computeData(scores) {
  // Death heatmap
  const lvCounts = {};
  scores.forEach(r => { const lv = r.level || 0; if (lv > 0) lvCounts[lv] = (lvCounts[lv] || 0) + 1; });
  const maxLv     = Object.keys(lvCounts).length ? Math.max(...Object.keys(lvCounts).map(Number)) : 0;
  const lvLabels  = Array.from({length: maxLv}, (_, i) => 'Lv ' + (i + 1));
  const lvData    = Array.from({length: maxLv}, (_, i) => lvCounts[i + 1] || 0);
  const maxDeaths = Math.max(...lvData, 1);
  const hardestLv = lvData.length ? lvData.indexOf(Math.max(...lvData)) + 1 : 0;

  // Daily active players
  const byDay = {};
  scores.forEach(r => {
    const day = r.timestamp ? r.timestamp.split(' ')[0] : null;
    if (!day) return;
    if (!byDay[day]) byDay[day] = new Set();
    byDay[day].add((r.name || '').toLowerCase());
  });
  const days      = Object.keys(byDay).sort();
  const dayLabels = days.map(d => { const [, m, dd] = d.split('-'); return `${dd}/${m}`; });
  const dayCounts = days.map(d => byDay[d].size);
  const todayCount = days.length ? byDay[days[days.length - 1]].size : 0;

  // Summary stats
  const topScore = scores.length ? scores[0].score : 0;
  const avg      = scores.length ? Math.round(scores.reduce((s, r) => s + r.score, 0) / scores.length) : 0;
  const names    = new Set(scores.map(r => (r.name || '').toLowerCase())).size;

  return { lvLabels, lvData, maxDeaths, hardestLv, days, dayLabels, dayCounts, todayCount, topScore, avg, names };
}
