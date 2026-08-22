#!/usr/bin/env node

// Reproduce the browser's Ko & Hu simulation and compare the rice ordering at
// takeoff and landing. Keep constants and integration order in sync with
// simulatePaper() in progs/cha-han.html.
const DT = 0.002;
const FREQUENCY = 3;
const RESISTANCE = 1;
const CYCLES = 3;
const RADIUS = 0.20;
const HALF_ANGLE = 1.2;

const selected = [
  [3, -0.69, 0.34, 0.39], [4, -0.89, 0.33, 0.32],
  [7, -0.79, 0.32, 0.36], [17, -0.74, 0.35, 0.38],
  [27, -0.99, 0.37, 0.33], [28, -0.79, 0.37, 0.36],
  [29, -0.89, 0.40, 0.38], [33, -0.89, 0.40, 0.37],
  [42, -0.84, 0.37, 0.35], [43, -0.89, 0.40, 0.38],
  [47, -0.89, 0.36, 0.38], [82, -0.84, 0.36, 0.39],
  [100, -0.69, 0.30, 0.39],
].map(([rank, phase, a1, a2]) => ({rank, phase, a1, a2}));

function kinematics(t, v, zeta = 0) {
  const w = 2 * Math.PI * FREQUENCY;
  const q1 = 0.3 + v.a1 * Math.cos(w * t);
  const q2 = v.a2 * Math.cos(w * t + v.phase);
  const d1 = -v.a1 * w * Math.sin(w * t);
  const d2 = -v.a2 * w * Math.sin(w * t + v.phase);
  const dd1 = -v.a1 * w * w * Math.cos(w * t);
  const dd2 = -v.a2 * w * w * Math.cos(w * t + v.phase);
  const q = q2 + zeta;
  return {
    x: RADIUS * (-Math.sin(q1) + Math.sin(q)),
    y: RADIUS * (Math.cos(q1) - Math.cos(q)),
    vx: RADIUS * (-Math.cos(q1) * d1 + Math.cos(q) * d2),
    vy: RADIUS * (-Math.sin(q1) * d1 + Math.sin(q) * d2),
    ax: RADIUS * (Math.sin(q1) * d1 ** 2 - Math.cos(q1) * dd1 - Math.sin(q) * d2 ** 2 + Math.cos(q) * dd2),
    ay: RADIUS * (-Math.cos(q1) * d1 ** 2 - Math.sin(q1) * dd1 + Math.cos(q) * d2 ** 2 + Math.sin(q) * dd2),
    cx: -RADIUS * Math.sin(q1), cy: RADIUS * Math.cos(q1), q2,
  };
}

function simulate(v) {
  const sites = Array.from({length: 21}, (_, id) => ({
    id, z: -HALF_ANGLE + id * HALF_ANGLE / 10, state: 'ON_WOK', armed: false,
    x: 0, y: 0, vx: 0, vy: 0, take: 0, event: null,
  }));
  const events = [];
  const duration = (CYCLES + 0.2) / FREQUENCY;
  for (let t = 0; t <= duration; t += DT) {
    const centre = kinematics(t, v);
    for (const rice of sites) {
      if (rice.state === 'ON_WOK') {
        const k = kinematics(t, v, rice.z);
        const nx = -Math.sin(k.q2 + rice.z), ny = Math.cos(k.q2 + rice.z);
        const separation = -k.ax * nx + (-9.81 - k.ay) * ny;
        if (separation <= RESISTANCE) rice.armed = true;
        if (rice.armed && separation > RESISTANCE && t < CYCLES / FREQUENCY) {
          rice.state = 'AIRBORNE'; rice.armed = false; rice.take = t;
          rice.x = k.x; rice.y = k.y; rice.vx = k.vx; rice.vy = k.vy;
          rice.event = {id: rice.id, cycle: Math.min(CYCLES - 1, Math.floor(t * FREQUENCY)), takeoff: rice.z};
        } else { rice.x = k.x; rice.y = k.y; }
      } else if (rice.state === 'AIRBORNE') {
        rice.vy -= 9.81 * DT; rice.x += rice.vx * DT; rice.y += rice.vy * DT;
        const dx = rice.x - centre.cx, dy = rice.y - centre.cy, radius = Math.hypot(dx, dy);
        if (t - rice.take > 0.012 && radius >= RADIUS && rice.vy < centre.vy + 1) {
          const landing = Math.atan2(dx, -dy) - centre.q2;
          if (Math.abs(landing) <= HALF_ANGLE) {
            rice.state = 'ON_WOK'; rice.event.landing = landing; events.push(rice.event);
            rice.event = null; rice.z = landing;
          } else { rice.state = 'LOST'; rice.event = null; }
        } else if (rice.y < -0.15 || Math.abs(rice.x) > 1) { rice.state = 'LOST'; rice.event = null; }
      }
    }
  }
  return events;
}

function orderMetric(events) {
  const takeoffRanks = new Map(
    [...events].sort((a, b) => a.takeoff - b.takeoff).map((event, rank) => [event, rank]),
  );
  let reversed = 0, pairs = 0, reversedDistance = 0, totalDistance = 0;
  for (let i = 0; i < events.length; i++) for (let j = i + 1; j < events.length; j++) {
    // A grain can relaunch within one cycle; it cannot form an ordering pair
    // with itself.
    if (events[i].id === events[j].id) continue;
    const before = events[i].takeoff - events[j].takeoff;
    const after = events[i].landing - events[j].landing;
    if (before === 0 || after === 0) continue;
    const distance = Math.abs(takeoffRanks.get(events[i]) - takeoffRanks.get(events[j]));
    pairs++;
    totalDistance += distance;
    if (before * after < 0) { reversed++; reversedDistance += distance; }
  }
  return {
    caught: events.length, reversed, pairs, rate: pairs ? reversed / pairs : null,
    reversedDistance, totalDistance,
    distanceRate: totalDistance ? reversedDistance / totalDistance : null,
  };
}

function permutationMetric(order) {
  return orderMetric(order.map((id, landing) => ({id, takeoff: id, landing})));
}

// Guard the intended interpretation: local neighbour swaps receive much less
// credit than a pancake-like complete reversal.
const neighbourExample = permutationMetric([1, 0, 3, 2, 5, 4, 7, 6, 9, 8]);
const reversalExample = permutationMetric([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
if (Math.abs(neighbourExample.distanceRate - 5 / 165) > 1e-12 || reversalExample.distanceRate !== 1) {
  throw new Error('distance-weighted order metric self-check failed');
}

const results = selected.map(v => {
  const events = simulate(v);
  const cycles = Array.from({length: CYCLES}, (_, cycle) => orderMetric(events.filter(e => e.cycle === cycle)));
  const reversed = cycles.reduce((sum, metric) => sum + metric.reversed, 0);
  const pairs = cycles.reduce((sum, metric) => sum + metric.pairs, 0);
  const reversedDistance = cycles.reduce((sum, metric) => sum + metric.reversedDistance, 0);
  const totalDistance = cycles.reduce((sum, metric) => sum + metric.totalDistance, 0);
  return {...v, cycles, pooled: {
    caught: events.length, reversed, pairs, rate: reversed / pairs,
    reversedDistance, totalDistance, distanceRate: reversedDistance / totalDistance,
  }};
});

if (process.argv.includes('--examples')) {
  console.log(`1032547698: ${(100 * neighbourExample.distanceRate).toFixed(1)}%`);
  console.log(`9876543210: ${(100 * reversalExample.distanceRate).toFixed(1)}%`);
} else if (process.argv.includes('--json')) console.log(JSON.stringify(results, null, 2));
else {
  console.log('rank\tcycle 1\tcycle 2\tcycle 3\tpooled within cycles');
  const show = m => m.rate === null ? `— (${m.caught})` :
    `${(100 * m.rate).toFixed(1)}% / distance ${(100 * m.distanceRate).toFixed(1)}% (${m.caught})`;
  for (const r of results) console.log([r.rank, ...r.cycles.map(show), show(r.pooled)].join('\t'));
}
