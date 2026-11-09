// EvalGen logo demo: the viewer grades 12 concept logos per brand, and each style axis is
// scored as an EvalGen assertion against those grades (coverage, false failure rate, alignment)

const BRANDS = [
  { id: 'google', name: 'Google' },
  { id: 'amazon', name: 'Amazon' },
];

// A logo file name lists the criteria it passes; NONE and EVERY are the anchors
const ORDER = ['CE', 'AB', 'EVERY', 'BD', 'AE', 'NONE', 'CD', 'BC', 'DE', 'AD', 'BE', 'AC'];
const PREVIEW = ['AE', 'NONE', 'EVERY'];

const AXES = [
  { id: 'A', name: 'Mark', yes: 'Logo only', no: 'Full name' },
  { id: 'B', name: 'Color', yes: 'Monochrome', no: 'Colored' },
  { id: 'C', name: 'Backing', yes: 'Badge', no: 'No background' },
  { id: 'D', name: 'Fill', yes: 'Gradient', no: 'Flat' },
  { id: 'E', name: 'Edges', yes: 'Sharp', no: 'Round' },
];

// An axis counts as one of your criteria once its alignment reaches this
const KEEP = 0.7;
const STORE = 'evalgen-logo-demo';

const ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  next: '<path d="m9 18 6-6-6-6"/>',
  redo: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
};

function icon(name, cls = '') {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

const src = (brand, logo) => `logo/${brand}/${logo}.svg`;
const passes = (logo, axis) => logo === 'EVERY' || (logo !== 'NONE' && logo.includes(axis));
const brandName = (id) => BRANDS.find((b) => b.id === id).name;
const pct = (x) => `${Math.round(x * 100)}%`;

// ---------- State ----------

function fresh() {
  return { screen: 'home', brand: null, index: 0, grades: { google: {}, amazon: {} } };
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    if (saved && saved.grades) return Object.assign(fresh(), saved);
  } catch (e) { /* storage blocked or corrupted */ }
  return fresh();
}

let state = load();

function save() {
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* storage blocked */ }
}

const graded = (brand) => ORDER.filter((l) => state.grades[brand][l] !== undefined).length;
const complete = (brand) => graded(brand) === ORDER.length;
const firstOpen = (brand) => Math.max(0, ORDER.findIndex((l) => state.grades[brand][l] === undefined));

// ---------- Scoring ----------

/**
 * Scores each axis as an assertion on both of its sides and keeps the better side
 *
 * Returns null when the grades hold no preferred or no non-preferred logo,
 * since coverage and false failure rate then have nothing to measure.
 */
function score(brand) {
  const grades = state.grades[brand];
  const good = ORDER.filter((l) => grades[l] === true);
  const bad = ORDER.filter((l) => grades[l] === false);
  if (!good.length || !bad.length) return null;

  const axes = AXES.map((axis) => {
    const sides = [true, false].map((side) => {
      const holds = (l) => passes(l, axis.id) === side;
      const coverage = bad.filter((l) => !holds(l)).length / bad.length;
      const ffr = good.filter((l) => !holds(l)).length / good.length;
      const keep = 1 - ffr;
      const alignment = coverage + keep ? (2 * coverage * keep) / (coverage + keep) : 0;
      return { side, coverage, ffr, alignment };
    });
    const best = sides[0].alignment >= sides[1].alignment ? sides[0] : sides[1];
    return { axis, ...best, label: best.side ? axis.yes : axis.no, kept: best.alignment >= KEEP };
  });

  const kept = axes.filter((a) => a.kept);
  const predict = (l) => kept.every((a) => passes(l, a.axis.id) === a.side);
  const matches = ORDER.filter((l) => predict(l) === grades[l]).length;
  return { axes, kept, predict, matches, good: good.length, bad: bad.length };
}

// ---------- Navigation ----------

const view = document.getElementById('view');
const steps = document.getElementById('steps');
let busy = false;

function go(screen, brand = state.brand) {
  state.screen = screen;
  state.brand = brand;
  if (screen === 'grade') state.index = firstOpen(brand);
  save();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function redo(brand) {
  state.grades[brand] = {};
  go('grade', brand);
}

function restart() {
  state = fresh();
  save();
  render();
}

function renderSteps() {
  const both = BRANDS.every((b) => complete(b.id));
  const tab = (label, active, onclick, done, disabled = false) =>
    `<button class="step${active ? ' active' : ''}" data-go="${onclick}" ${disabled ? 'disabled' : ''}>
      ${done ? icon('check', 'tick') : ''}${label}</button>`;
  steps.innerHTML = [
    tab('Start', state.screen === 'home', 'home', false),
    '<span class="step-sep"></span>',
    ...BRANDS.map((b) => tab(b.name, state.brand === b.id && ['grade', 'result'].includes(state.screen), b.id, complete(b.id))),
    '<span class="step-sep"></span>',
    tab('Summary', state.screen === 'summary', 'summary', false, !both),
  ].join('');
  steps.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => {
    const target = button.dataset.go;
    if (target === 'home' || target === 'summary') go(target, null);
    else go(complete(target) ? 'result' : 'grade', target);
  }));
}

function render() {
  renderSteps();
  const screens = { home: renderHome, grade: renderGrade, result: renderResult, summary: renderSummary };
  (screens[state.screen] || renderHome)();
}

// ---------- Home ----------

function renderHome() {
  const cards = BRANDS.map((b) => {
    const count = graded(b.id);
    const status = complete(b.id)
      ? `<span class="status done">${icon('check', 'tick')} Done, view result</span>`
      : count ? `<span class="status">${count} of ${ORDER.length} graded</span>` : '<span class="status">Not started</span>';
    return `
      <button class="box brand-card" data-brand="${b.id}">
        <div class="previews">${PREVIEW.map((l) => `<div class="tile"><img src="${src(b.id, l)}" alt=""></div>`).join('')}</div>
        <div class="brand-row"><span class="box-title">Redesign ${b.name}</span>${status}</div>
        <div class="meter"><span style="width:${(100 * count) / ORDER.length}%"></span></div>
      </button>`;
  }).join('');

  const both = BRANDS.every((b) => complete(b.id));
  view.innerHTML = `
    <section class="screen">
      <p class="intro">You get 12 concept redesigns per brand. Mark each one as preferred or not, and the demo works out which design criteria your picks follow. Do both brands to see whether your taste holds across them.</p>
      <div class="brands">${cards}</div>
      <div class="actions">
        ${both ? `<button class="btn primary" id="to-summary">${icon('grid')} See summary</button>` : ''}
        ${graded('google') + graded('amazon') ? `<button class="btn ghost" id="restart">${icon('redo')} Start over</button>` : ''}
      </div>
    </section>`;

  view.querySelectorAll('[data-brand]').forEach((card) => card.addEventListener('click', () => {
    const id = card.dataset.brand;
    go(complete(id) ? 'result' : 'grade', id);
  }));
  view.querySelector('#to-summary')?.addEventListener('click', () => go('summary', null));
  view.querySelector('#restart')?.addEventListener('click', restart);
}

// ---------- Grade ----------

function renderGrade() {
  const brand = state.brand;
  const logo = ORDER[state.index];
  const grade = state.grades[brand][logo];
  const dots = ORDER.map((l, i) => {
    const g = state.grades[brand][l];
    const cls = g === true ? ' yes' : g === false ? ' no' : '';
    return `<button class="dot${cls}${i === state.index ? ' current' : ''}" data-i="${i}" aria-label="Logo ${i + 1}"></button>`;
  }).join('');
  const stamp = grade === undefined ? '' : `<span class="stamp ${grade ? 'yes' : 'no'}">${grade ? 'Preferred' : 'Not preferred'}</span>`;

  view.innerHTML = `
    <section class="screen grade">
      <div class="grade-top">
        <div class="grade-meta"><span>Redesign <b>${brandName(brand)}</b></span><span>${state.index + 1} / ${ORDER.length}</span></div>
        <div class="dots">${dots}</div>
      </div>
      <div class="stage" id="stage">
        <div class="tile card-logo enter" id="card"><img src="${src(brand, logo)}" alt="Concept logo ${state.index + 1}" draggable="false"></div>
        ${stamp}
      </div>
      <div class="choice">
        <button class="btn no${grade === false ? ' active' : ''}" data-grade="no">${icon('x')} Not preferred <span class="kbd">&larr;</span></button>
        <button class="btn yes${grade === true ? ' active' : ''}" data-grade="yes">${icon('check')} Preferred <span class="kbd">&rarr;</span></button>
      </div>
      <div class="grade-foot">
        <button class="btn ghost" id="prev" ${state.index === 0 ? 'disabled' : ''}>${icon('back')} Back</button>
        ${complete(brand) ? `<button class="btn primary" id="finish">See result ${icon('next')}</button>` : ''}
      </div>
    </section>`;

  view.querySelectorAll('[data-grade]').forEach((b) => b.addEventListener('click', () => choose(b.dataset.grade === 'yes')));
  view.querySelectorAll('.dot').forEach((d) => d.addEventListener('click', () => jump(Number(d.dataset.i))));
  view.querySelector('#prev').addEventListener('click', () => jump(state.index - 1));
  view.querySelector('#finish')?.addEventListener('click', () => go('result'));
  swipe(document.getElementById('stage'));
  ORDER.forEach((l) => { new Image().src = src(brand, l); });
}

function leave(direction, then) {
  const card = document.getElementById('card');
  if (!card) return then();
  busy = true;
  card.classList.remove('enter');
  card.classList.add(`out-${direction}`);
  setTimeout(() => { busy = false; then(); }, 200);
}

function choose(preferred) {
  if (busy || state.screen !== 'grade') return;
  const brand = state.brand;
  state.grades[brand][ORDER[state.index]] = preferred;
  save();
  leave(preferred ? 'right' : 'left', () => {
    const next = ORDER.findIndex((l, i) => i > state.index && state.grades[brand][l] === undefined);
    const wrap = firstOpen(brand);
    if (complete(brand)) return go('result');
    state.index = next !== -1 ? next : wrap;
    save();
    render();
  });
}

function jump(index) {
  if (busy || index < 0 || index >= ORDER.length || index === state.index) return;
  leave('back', () => { state.index = index; save(); render(); });
}

function swipe(stage) {
  let start = null;
  stage.addEventListener('pointerdown', (e) => { start = e.clientX; });
  stage.addEventListener('pointerup', (e) => {
    if (start === null) return;
    const dx = e.clientX - start;
    start = null;
    if (Math.abs(dx) > 60) choose(dx > 0);
  });
  stage.addEventListener('pointercancel', () => { start = null; });
}

document.addEventListener('keydown', (e) => {
  if (state.screen !== 'grade' || e.metaKey || e.ctrlKey || e.altKey) return;
  const key = e.key.toLowerCase();
  if (key === 'arrowright' || key === 'y') { e.preventDefault(); choose(true); }
  else if (key === 'arrowleft' || key === 'n') { e.preventDefault(); choose(false); }
  else if (key === 'backspace' || key === 'arrowup') { e.preventDefault(); jump(state.index - 1); }
});

// ---------- Result ----------

function axisRows(result) {
  return result.axes.map((a) => `
    <div class="row${a.kept ? ' kept' : ''}">
      <div class="row-name">${a.axis.name}<small>${a.axis.yes} vs ${a.axis.no}</small></div>
      <div class="row-body">
        <div class="row-side"><span class="chip${a.kept ? '' : ' flat'}">${a.label}</span>
          <span class="muted small">${a.kept ? 'one of your criteria' : 'no clear preference'}</span></div>
        <div class="bar"><span data-w="${pct(a.alignment)}"></span></div>
        <div class="row-stats">catches ${pct(a.coverage)} of rejects, wrongly fails ${pct(a.ffr)} of picks</div>
      </div>
      <div class="row-pct">${pct(a.alignment)}</div>
    </div>`).join('');
}

function growBars() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    view.querySelectorAll('.bar > span').forEach((s) => { s.style.width = s.dataset.w; });
  }));
}

function nextAction(brand) {
  const other = BRANDS.find((b) => b.id !== brand);
  if (complete(other.id)) return `<button class="btn primary" id="next">${icon('grid')} See summary</button>`;
  return `<button class="btn primary" id="next">Continue with ${other.name} ${icon('next')}</button>`;
}

function bindNext(brand) {
  const other = BRANDS.find((b) => b.id !== brand);
  view.querySelector('#next').addEventListener('click', () =>
    complete(other.id) ? go('summary', null) : go('grade', other.id));
}

function renderResult() {
  const brand = state.brand;
  const result = score(brand);
  const grades = state.grades[brand];

  if (!result) {
    const all = ORDER.every((l) => grades[l] === true);
    view.innerHTML = `
      <section class="screen box">
        <h3 class="box-title">Nothing to tell apart</h3>
        <p class="muted" style="margin-top:0.5rem">You marked every ${brandName(brand)} logo as ${all ? 'preferred' : 'not preferred'}. Criteria are inferred from the contrast between picks and rejects, so mark at least one of each.</p>
        <div class="actions">
          <button class="btn primary" id="redo">${icon('redo')} Redo ${brandName(brand)}</button>
          ${nextAction(brand)}
        </div>
      </section>`;
    view.querySelector('#redo').addEventListener('click', () => redo(brand));
    bindNext(brand);
    return;
  }

  const headline = result.kept.length
    ? result.kept.map((a) => `<span class="chip">${a.label}</span>`).join('')
    : '<span class="muted">no single criterion explains your picks</span>';
  const thumbs = ORDER.map((l) => {
    const miss = result.predict(l) !== grades[l];
    return `<div class="thumb ${grades[l] ? 'yes' : 'no'}"><div class="tile"><img src="${src(brand, l)}" alt=""></div>${miss ? '<span class="miss">missed</span>' : ''}</div>`;
  }).join('');

  view.innerHTML = `
    <section class="screen">
      <div class="box">
        <div class="result-head">
          <div>
            <h3>Your ${brandName(brand)} criteria</h3>
            <div class="headline">${headline}</div>
          </div>
          <div class="score">
            <div class="score-num">${result.matches}<span class="muted" style="font-size:1rem"> / ${ORDER.length}</span></div>
            <div class="score-label">picks explained by these criteria</div>
          </div>
        </div>
        <div class="rows">${axisRows(result)}</div>
        <div class="section-title">Your grades (${result.good} preferred, ${result.bad} not)</div>
        <div class="thumbs">${thumbs}</div>
        <div class="legend">
          <span><i style="background:var(--green)"></i>Preferred</span>
          <span><i style="background:var(--red)"></i>Not preferred</span>
          <span><i style="background:var(--secondary)"></i>missed: your criteria predict the opposite grade</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn ghost" id="redo">${icon('redo')} Redo ${brandName(brand)}</button>
        <button class="btn ghost" id="review">${icon('back')} Review grades</button>
        ${nextAction(brand)}
      </div>
    </section>`;

  view.querySelector('#redo').addEventListener('click', () => redo(brand));
  view.querySelector('#review').addEventListener('click', () => { state.screen = 'grade'; state.index = 0; save(); render(); });
  bindNext(brand);
  growBars();
}

// ---------- Summary ----------

function renderSummary() {
  if (!BRANDS.every((b) => complete(b.id))) return go('home', null);
  const results = Object.fromEntries(BRANDS.map((b) => [b.id, score(b.id)]));

  const cell = (r, i) => {
    if (!r) return '<span class="muted">n/a</span>';
    const a = r.axes[i];
    return `<span class="chip${a.kept ? '' : ' flat'}">${a.label}</span><span class="pct">${pct(a.alignment)}</span>`;
  };
  let same = 0;
  let counted = 0;
  const rows = AXES.map((axis, i) => {
    const [g, m] = BRANDS.map((b) => results[b.id] && results[b.id].axes[i]);
    let verdict = '<span class="verdict none">no preference</span>';
    if (g && m && (g.kept || m.kept)) {
      counted += 1;
      if (g.kept && m.kept && g.side === m.side) { same += 1; verdict = `<span class="verdict same">${icon('check', 'tick')} consistent</span>`; }
      else verdict = '<span class="verdict drift">drifted</span>';
    }
    return `<tr><td>${axis.name}</td><td>${cell(results.google, i)}</td><td>${cell(results.amazon, i)}</td><td>${verdict}</td></tr>`;
  }).join('');

  const cards = BRANDS.map((b) => {
    const r = results[b.id];
    const body = !r ? '<span class="muted small">Needs at least one preferred and one rejected logo.</span>'
      : r.kept.length ? `<div class="chips">${r.kept.map((a) => `<span class="chip">${a.label}</span>`).join('')}</div>
        <span class="muted small">${r.matches} of ${ORDER.length} picks explained</span>`
      : '<span class="muted small">No single criterion explains your picks.</span>';
    return `<div class="box"><span class="box-title">${b.name}</span>${body}
      <div><button class="btn ghost" data-redo="${b.id}">${icon('redo')} Redo ${b.name}</button></div></div>`;
  }).join('');

  const line = counted
    ? `<b>${same} of ${counted}</b> criteria you used carried over between brands`
    : 'Neither brand showed a clear criterion';

  view.innerHTML = `
    <section class="screen">
      <p class="big-line">${line}</p>
      <div class="pair">${cards}</div>
      <div class="box">
        <span class="box-title">Criteria by brand</span>
        <table class="compare">
          <thead><tr><th>Criterion</th><th>Google</th><th>Amazon</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="muted small" style="margin-top:0.5rem">A criterion that holds for one brand and not the other is criteria drift: the rule you would write depends on the outputs you have seen.</p>
      </div>
      <div class="actions"><button class="btn primary" id="restart">${icon('redo')} Start over</button></div>
    </section>`;

  view.querySelectorAll('[data-redo]').forEach((b) => b.addEventListener('click', () => redo(b.dataset.redo)));
  view.querySelector('#restart').addEventListener('click', restart);
}

render();
