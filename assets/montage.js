// Hero ambient council-meeting montage (vanilla port of animation/montage.jsx).
// Data sets, shot internals, durations, and play order are matched 1:1 to the
// reference. Integration bits at the bottom (IntersectionObserver, visibility,
// reduced-motion handling, pause control) adapt the preserved sequence to this hero.
// All names, figures, quotations and trends are illustrative sample content.
(function(){
  var mount = document.getElementById('heroMontage');
  if (!mount) return;
  mount.classList.add('mg-montage');
  mount.setAttribute('aria-hidden', 'true');

  var PRIMARY = '#e4b95b';
  var PRIMARY_DIM = 'rgba(228,185,91,0.66)';
  var PRIMARY_FAINT = 'rgba(228,185,91,0.20)';
  var FONT_DISPLAY = "var(--font-display, Arial, sans-serif)";
  var FONT_BODY = "var(--font-body, Arial, sans-serif)";

  // ── DATA (mirrors animation/montage.jsx) ──────────────────────────────────

  var ROLL = [
    ['CHEN, M.', 'YEA'],
    ['OKAFOR, R.', 'YEA'],
    ['RAVENSCROFT, J.', 'NAY'],
    ['ALMEIDA, P.', 'YEA'],
    ['TANAKA, S.', 'ABS'],
    ['FERRIS, D.', 'YEA'],
    ['NWAMBE, A.', 'YEA'],
    ['KOSZINSKI, V.', 'NAY'],
    ['ALARIO, F.', 'YEA'],
    ['BHARGAVA, K.', 'YEA']
  ];

  var BUDGET = [
    { label: 'PUBLIC WORKS', v: 0.82 },
    { label: 'PARKS & REC',  v: 0.31 },
    { label: 'TRANSIT',      v: 0.66 },
    { label: 'HOUSING',      v: 0.94 },
    { label: 'POLICE',       v: 0.71 },
    { label: 'LIBRARIES',    v: 0.18 }
  ];

  var TOPICS = [
    'AFFORDABLE HOUSING',
    'BIKE LANE EXPANSION',
    'WATER MAIN REPLACEMENT',
    'TENANT PROTECTIONS',
    'MINIMUM WAGE',
    'ZONING REFORM',
    'CLIMATE RESILIENCE',
    'LIBRARY HOURS',
    'SHELTER FUNDING'
  ];

  var QUOTES = [
    '\u201CTHE MOTION TO AMEND IS BEFORE US\u2014\u201D',
    '\u201C\u2014I YIELD MY TIME TO THE CHAIR.\u201D',
    '\u201CALL THOSE IN FAVOR, SIGNIFY BY\u2014\u201D',
    '\u201CTHE AYES HAVE IT. SO ORDERED.\u201D'
  ];

  var STATS = [
    { n: '$31.4M', l: 'ALLOCATED TO HOUSING' },
    { n: '+1,200', l: 'AFFORDABLE UNITS BY 2028' },
    { n: '0.7%',   l: 'PROPERTY TAX INCREASE' },
    { n: '47',     l: 'PUBLIC SPEAKERS HEARD' },
    { n: '62,400', l: 'RESIDENTS IMPACTED' },
    { n: '9\u20132',  l: 'FINAL VOTE COUNT' }
  ];

  var TRENDS = [
    '311 COMPLAINTS \u00B7 TRANSIT',
    '311 COMPLAINTS \u00B7 POTHOLES',
    'RENT INDEX',
    'PERMIT APPLICATIONS',
    'EVICTION FILINGS'
  ];

  var EVENTS = [
    { t: '14:00', l: 'GAVEL IN' },
    { t: '14:08', l: 'MIN APPROVED' },
    { t: '14:21', l: 'ITEM 4' },
    { t: '14:34', l: 'MOTION 24-118 \u00B7 PASS' },
    { t: '14:51', l: 'PUBLIC COMMENT' },
    { t: '15:22', l: 'RECESS' },
    { t: '15:37', l: 'ITEM 7B \u00B7 BUDGET' },
    { t: '16:09', l: 'ADJOURN' }
  ];

  // ── HELPERS ───────────────────────────────────────────────────────────────

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  // Seed-based smooth wave path — matches the reference sparkPath exactly so
  // each TRENDS line draws a unique but stable curve.
  function sparkPath(seed, w, h) {
    var pts = [];
    for (var i = 0; i <= 40; i++) {
      var x = (i / 40) * w;
      var y = h / 2 + Math.sin(i * 0.3 + seed) * (h / 3) + Math.sin(i * 0.7 + seed * 2) * (h / 6);
      pts.push(x.toFixed(1) + ',' + y.toFixed(1));
    }
    return 'M ' + pts.join(' L ');
  }

  // Each shot fills the frame with the meta labels pinned to corners and the
  // actual content centered on both axes via flex.
  function shotRoot() {
    var d = document.createElement('div');
    d.className = 'mg-shot';
    return d;
  }

  function makeMeta(text, side) {
    var d = document.createElement('div');
    d.className = 'mg-meta mg-meta-' + side;
    d.textContent = text;
    return d;
  }
  function metaLine(text)  { return makeMeta(text, 'left'); }
  function metaRight(text) { return makeMeta(text, 'right'); }
  function metaFoot(text)  { return makeMeta(text, 'foot'); }

  // ── SHOTS ─────────────────────────────────────────────────────────────────

  // Shot 1: vote tally — three big tabular numerals (YEA/NAY/ABS) ticking up
  // with corner timestamp and a "—— PASSES ——" foot note.
  function ShotVoteTally() {
    var root = shotRoot();
    root.appendChild(metaLine('ROLL CALL \u00B7 MOTION 24-118'));
    root.appendChild(metaRight('14:32:08'));
    root.appendChild(metaFoot('\u2014\u2014 PASSES \u2014\u2014'));
    var grid = document.createElement('div');
    grid.className = 'mg-tally';
    var labels = ['YEA', 'NAY', 'ABSTAIN'];
    var colors = [PRIMARY, PRIMARY_DIM, PRIMARY_FAINT];
    var nums = [];
    for (var i = 0; i < 3; i++) {
      var cell = document.createElement('div');
      cell.className = 'mg-tally-cell';
      cell.style.color = colors[i];
      var num = document.createElement('div');
      num.className = 'mg-tally-number';
      num.textContent = '00';
      var lbl = document.createElement('div');
      lbl.className = 'mg-tally-label';
      lbl.textContent = labels[i];
      cell.appendChild(num); cell.appendChild(lbl);
      grid.appendChild(cell);
      nums.push(num);
    }
    root.appendChild(grid);
    return {
      root: root,
      update: function(p) {
        var y = Math.min(7, Math.floor(p * 9));
        var n = Math.min(2, Math.floor(p * 4));
        var a = Math.min(1, Math.floor(p * 2));
        nums[0].textContent = pad2(y);
        nums[1].textContent = pad2(n);
        nums[2].textContent = pad2(a);
      }
    };
  }

  // Shot 2: roll-call list — names reveal sequentially with vote markers.
  function ShotRollCall() {
    var root = shotRoot();
    root.appendChild(metaLine('DISTRICT 4 \u00B7 COUNCIL CHAMBERS'));
    root.appendChild(metaRight('SESSION 247'));
    var list = document.createElement('div');
    list.className = 'mg-roll';
    var rows = [];
    for (var i = 0; i < ROLL.length; i++) {
      var row = document.createElement('div');
      row.className = 'mg-roll-row';
      row.style.color = ROLL[i][1] === 'NAY' ? PRIMARY_DIM : PRIMARY;
      var name = document.createElement('span');
      name.textContent = pad2(i + 1) + '  ' + ROLL[i][0];
      var vote = document.createElement('span');
      vote.className = 'mg-roll-vote';
      vote.dataset.full = ROLL[i][1];
      row.appendChild(name);
      row.appendChild(vote);
      list.appendChild(row);
      rows.push({ row: row, vote: vote });
    }
    root.appendChild(list);
    return {
      root: root,
      update: function(p) {
        var reveal = Math.floor(p * (ROLL.length + 1));
        for (var i = 0; i < rows.length; i++) {
          var on = i < reveal;
          rows[i].row.style.opacity = on ? '1' : '0.15';
          rows[i].vote.textContent = on ? rows[i].vote.dataset.full : '\u2014';
        }
      }
    };
  }

  // Shot 3: motion passed — bold "PASSED" with ordinance subtitle and a flash
  // arrow that snaps in once we cross the halfway point of the shot.
  function ShotMotionPassed() {
    var root = shotRoot();
    root.appendChild(metaLine('14:34:51 \u00B7 MOTION CARRIED'));
    var stack = document.createElement('div');
    stack.className = 'mg-centered';
    var big = document.createElement('div');
    big.className = 'mg-passed';
    big.textContent = 'PASSED';
    var sub = document.createElement('div');
    sub.className = 'mg-passed-caption';
    sub.textContent = 'ORDINANCE 24-118 \u00B7 ZONING AMENDMENT';
    var arrow = document.createElement('div');
    arrow.className = 'mg-passed-arrow';
    arrow.innerHTML = '<svg width="180" height="22" viewBox="0 0 180 22" aria-hidden="true"><line x1="0" y1="11" x2="180" y2="11" stroke="' + PRIMARY + '" stroke-width="2" /><polygon points="170,4 180,11 170,18" fill="' + PRIMARY + '" /></svg>';
    stack.appendChild(big);
    stack.appendChild(sub);
    stack.appendChild(arrow);
    root.appendChild(stack);
    return {
      root: root,
      update: function(p) {
        arrow.style.opacity = p > 0.5 ? '1' : '0';
      }
    };
  }

  // Shot 4: budget — six rows of [LABEL] [BAR] [VALUE] with staggered fills
  // driven by the reference formula `min(1, p*1.4 - i*0.05) * v`.
  function ShotBudget() {
    var root = shotRoot();
    root.appendChild(metaLine('FY26 APPROPRIATIONS \u00B7 $147.2M'));
    root.appendChild(metaRight('ITEM 7.B'));
    var stack = document.createElement('div');
    stack.className = 'mg-budget';
    var rows = [];
    for (var i = 0; i < BUDGET.length; i++) {
      var b = BUDGET[i];
      var row = document.createElement('div');
      row.className = 'mg-budget-row';
      var lbl = document.createElement('div');
      lbl.className = 'mg-budget-label';
      lbl.textContent = b.label;
      var track = document.createElement('div');
      track.className = 'mg-budget-track';
      var fill = document.createElement('div');
      fill.className = 'mg-budget-fill';
      track.appendChild(fill);
      var amt = document.createElement('div');
      amt.className = 'mg-budget-amount';
      amt.textContent = (b.v * 31.4).toFixed(1) + 'M';
      row.appendChild(lbl); row.appendChild(track); row.appendChild(amt);
      stack.appendChild(row);
      rows.push({ fill: fill, v: b.v });
    }
    root.appendChild(stack);
    return {
      root: root,
      update: function(p) {
        for (var i = 0; i < rows.length; i++) {
          var w = Math.min(1, p * 1.4 - i * 0.05) * rows[i].v;
          rows[i].fill.style.width = (Math.max(0, w) * 100).toFixed(1) + '%';
        }
      }
    };
  }

  // Shot 5: agenda topics — current item in PRIMARY, struck/dimmed before it,
  // faint after it. Matches the reference's "01 · TOPIC" indexed format.
  function ShotTopics() {
    var root = shotRoot();
    root.appendChild(metaLine('AGENDA \u00B7 14 ITEMS'));
    var list = document.createElement('div');
    list.className = 'mg-topics';
    var rows = [];
    for (var i = 0; i < TOPICS.length; i++) {
      var row = document.createElement('div');
      row.className = 'mg-topic';
      row.textContent = pad2(i + 1) + ' \u00B7 ' + TOPICS[i];
      list.appendChild(row);
      rows.push(row);
    }
    root.appendChild(list);
    return {
      root: root,
      update: function(p) {
        var cur = Math.floor(p * TOPICS.length);
        for (var i = 0; i < rows.length; i++) {
          rows[i].style.color = i === cur ? PRIMARY : PRIMARY_FAINT;
          rows[i].style.textDecoration = i < cur ? 'line-through' : 'none';
        }
      }
    };
  }

  // Shot 6: public-comment timer — 3:00 → 0:00 countdown in tabular numerals.
  function ShotTimer() {
    var root = shotRoot();
    root.appendChild(metaLine('PUBLIC COMMENT \u00B7 SPEAKER 23/47'));
    root.appendChild(metaRight('3:00 LIMIT'));
    var stack = document.createElement('div');
    stack.className = 'mg-centered';
    var big = document.createElement('div');
    big.className = 'mg-timer';
    big.textContent = '3:00';
    var sub = document.createElement('div');
    sub.className = 'mg-timer-caption';
    sub.textContent = 'REMAINING';
    stack.appendChild(big); stack.appendChild(sub);
    root.appendChild(stack);
    return {
      root: root,
      update: function(p) {
        var sec = Math.max(0, 180 - Math.floor(p * 180));
        big.textContent = Math.floor(sec / 60) + ':' + pad2(sec % 60);
      }
    };
  }

  // Shot 7: district map — a 12×16 grid that fills progressively, with every
  // 7th filled cell highlighted at full PRIMARY.
  function ShotMap() {
    var root = shotRoot();
    root.appendChild(metaLine('IMPACT \u00B7 DISTRICT 4'));
    root.appendChild(metaRight('~62,400 RESIDENTS'));
    root.appendChild(metaFoot('1 SQ \u2248 325 PEOPLE AFFECTED'));
    var ROWS = 12, COLS = 16, total = ROWS * COLS;
    var grid = document.createElement('div');
    grid.className = 'mg-map';
    var cells = [];
    for (var k = 0; k < total; k++) {
      var c = document.createElement('div');
      c.style.background = PRIMARY_FAINT;
      c.style.opacity = '0.4';
      grid.appendChild(c);
      cells.push(c);
    }
    root.appendChild(grid);
    return {
      root: root,
      update: function(p) {
        var filled = Math.floor(p * total);
        for (var k = 0; k < total; k++) {
          var on = k < filled;
          var hot = on && (k * 31) % 7 === 0;
          cells[k].style.background = hot ? PRIMARY : on ? PRIMARY_DIM : PRIMARY_FAINT;
          cells[k].style.opacity = on ? '1' : '0.4';
        }
      }
    };
  }

  // Shot 8: minute fragment — one of four chamber-language quotes types in
  // character-by-character with a writing cursor.
  function ShotQuote(idx) {
    var root = shotRoot();
    root.appendChild(metaLine('VERBATIM MINUTES \u00B7 PG 47'));
    var q = document.createElement('div');
    q.className = 'mg-quote';
    var cursor = document.createElement('span');
    cursor.textContent = '\u258C';
    q.appendChild(document.createTextNode(''));
    q.appendChild(cursor);
    root.appendChild(q);
    var full = QUOTES[idx % QUOTES.length];
    return {
      root: root,
      update: function(p) {
        var n = Math.floor(p * full.length);
        q.firstChild.textContent = full.slice(0, n);
        cursor.style.opacity = p < 1 ? '1' : '0';
      }
    };
  }

  // Shot 9: passage-rate donut — three arcs (70/20/10) plus a center label.
  function ShotDonut() {
    var root = shotRoot();
    root.appendChild(metaLine('5-YEAR PASSAGE RATE'));
    root.appendChild(metaRight('n = 1,248 MOTIONS'));
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '-100 -100 200 200');
    svg.classList.add('mg-donut');
    function arcPath(start, end) {
      var R = 80, IR = 50;
      var a1 = ((start - 90) * Math.PI) / 180;
      var a2 = ((end - 90) * Math.PI) / 180;
      var large = end - start > 180 ? 1 : 0;
      var x1 = R * Math.cos(a1), y1 = R * Math.sin(a1);
      var x2 = R * Math.cos(a2), y2 = R * Math.sin(a2);
      var x3 = IR * Math.cos(a2), y3 = IR * Math.sin(a2);
      var x4 = IR * Math.cos(a1), y4 = IR * Math.sin(a1);
      return 'M ' + x1 + ' ' + y1 + ' A ' + R + ' ' + R + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 +
             ' L ' + x3 + ' ' + y3 + ' A ' + IR + ' ' + IR + ' 0 ' + large + ' 0 ' + x4 + ' ' + y4 + ' Z';
    }
    var arcs = [];
    var colors = [PRIMARY, PRIMARY_DIM, PRIMARY_FAINT];
    for (var i = 0; i < 3; i++) {
      var path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('fill', colors[i]);
      svg.appendChild(path);
      arcs.push(path);
    }
    var t1 = document.createElementNS(SVG_NS, 'text');
    t1.setAttribute('x', '0'); t1.setAttribute('y', '-4');
    t1.setAttribute('text-anchor', 'middle');
    t1.setAttribute('fill', PRIMARY);
    t1.setAttribute('font-family', FONT_DISPLAY);
    t1.setAttribute('font-size', '22');
    t1.setAttribute('font-weight', '700');
    t1.textContent = '70%';
    svg.appendChild(t1);
    var t2 = document.createElementNS(SVG_NS, 'text');
    t2.setAttribute('x', '0'); t2.setAttribute('y', '14');
    t2.setAttribute('text-anchor', 'middle');
    t2.setAttribute('fill', PRIMARY_DIM);
    t2.setAttribute('font-family', FONT_BODY);
    t2.setAttribute('font-size', '8');
    t2.setAttribute('letter-spacing', '3');
    t2.textContent = 'PASSED';
    svg.appendChild(t2);
    root.appendChild(svg);
    return {
      root: root,
      update: function(p) {
        var total = 360;
        var yea = total * 0.7 * Math.min(1, p * 1.2);
        var nay = total * 0.2 * Math.min(1, Math.max(0, p * 1.4 - 0.2));
        var abs = total * 0.1 * Math.min(1, Math.max(0, p * 1.6 - 0.4));
        var spans = [
          [0, yea],
          [yea, yea + nay],
          [yea + nay, yea + nay + abs]
        ];
        for (var i = 0; i < 3; i++) {
          var s = spans[i][0], e = spans[i][1];
          arcs[i].setAttribute('d', e - s < 0.5 ? '' : arcPath(s, e));
        }
      }
    };
  }

  // Shot 10: session timeline — eight named events on a horizontal strip,
  // each tick + label brightens up as the playhead reaches it.
  function ShotTimeline() {
    var root = shotRoot();
    root.appendChild(metaLine('SESSION TIMELINE \u00B7 02H 09M'));
    var wrap = document.createElement('div');
    wrap.className = 'mg-timeline';
    var bar = document.createElement('div');
    bar.className = 'mg-timeline-bar';
    var fill = document.createElement('div');
    fill.className = 'mg-timeline-fill';
    bar.appendChild(fill);
    var ticks = [];
    for (var i = 0; i < EVENTS.length; i++) {
      var tick = document.createElement('div');
      tick.className = 'mg-timeline-tick';
      tick.style.left = (i / (EVENTS.length - 1) * 100) + '%';
      bar.appendChild(tick);
      ticks.push(tick);
    }
    var labels = document.createElement('div');
    labels.className = 'mg-timeline-labels';
    var labs = [];
    for (var j = 0; j < EVENTS.length; j++) {
      var lbl = document.createElement('div');
      lbl.className = 'mg-timeline-label';
      lbl.style.left = (j / (EVENTS.length - 1) * 100) + '%';
      var time = document.createElement('div');
      time.className = 'mg-timeline-time';
      time.textContent = EVENTS[j].t;
      var sub = document.createElement('div');
      sub.className = 'mg-timeline-caption';
      sub.textContent = EVENTS[j].l;
      lbl.appendChild(time); lbl.appendChild(sub);
      labels.appendChild(lbl);
      labs.push(lbl);
    }
    wrap.appendChild(bar);
    wrap.appendChild(labels);
    root.appendChild(wrap);
    return {
      root: root,
      update: function(p) {
        var cur = Math.floor(p * EVENTS.length);
        fill.style.width = (cur / EVENTS.length * 100).toFixed(2) + '%';
        for (var i = 0; i < ticks.length; i++) {
          ticks[i].style.background = i <= cur ? PRIMARY : PRIMARY_FAINT;
          labs[i].style.color = i <= cur ? PRIMARY : PRIMARY_FAINT;
        }
      }
    };
  }

  // Shot 11: stat slam — a single big number with a small label, faint scale-in
  // across the shot to give it punch on the cut.
  function ShotStat(idx) {
    var s = STATS[idx % STATS.length];
    var root = shotRoot();
    root.appendChild(metaLine('IMPACT METRIC'));
    root.appendChild(metaRight(pad2(idx + 1) + ' / ' + STATS.length));
    var stack = document.createElement('div');
    stack.className = 'mg-centered mg-stat';
    var big = document.createElement('div');
    big.className = 'mg-stat-number';
    big.textContent = s.n;
    var lbl = document.createElement('div');
    lbl.className = 'mg-stat-caption';
    lbl.textContent = s.l;
    stack.appendChild(big); stack.appendChild(lbl);
    root.appendChild(stack);
    return {
      root: root,
      update: function(p) {
        var scale = 0.96 + p * 0.04;
        stack.style.transform = 'scale(' + scale.toFixed(3) + ')';
      }
    };
  }

  // Shot 12: trend packet — five labelled sparklines that draw on with a
  // staggered dash-offset reveal.
  function ShotTrends() {
    var root = shotRoot();
    root.appendChild(metaLine('TREND PACKET \u00B7 2019\u20132025'));
    var wrap = document.createElement('div');
    wrap.className = 'mg-trends';
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var W = 600, H = 60;
    var paths = [];
    for (var i = 0; i < TRENDS.length; i++) {
      var row = document.createElement('div');
      row.className = 'mg-trends-row';
      var lbl = document.createElement('div');
      lbl.className = 'mg-trends-label';
      lbl.textContent = TRENDS[i];
      var svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.classList.add('mg-trends-line');
      var path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', sparkPath(i + 1, W, H));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', PRIMARY);
      path.setAttribute('stroke-width', '2');
      var dash = W * 2;
      path.setAttribute('stroke-dasharray', String(dash));
      path.setAttribute('stroke-dashoffset', String(dash));
      svg.appendChild(path);
      row.appendChild(lbl); row.appendChild(svg);
      wrap.appendChild(row);
      paths.push({ path: path, dash: dash });
    }
    root.appendChild(wrap);
    return {
      root: root,
      update: function(p) {
        for (var i = 0; i < paths.length; i++) {
          var local = Math.min(1, Math.max(0, p * 1.5 - i * 0.08));
          paths[i].path.setAttribute('stroke-dashoffset', String(paths[i].dash * (1 - local)));
        }
      }
    };
  }

  // ── SHOT LIST (matches reference order and per-shot durations in ms) ─────

  var SHOT_LIST = [
    { kind: 'timeline', dur: 1100, idx: 0 },
    { kind: 'tally',    dur: 700,  idx: 0 },
    { kind: 'quote',    dur: 850,  idx: 0 },
    { kind: 'roll',     dur: 1200, idx: 0 },
    { kind: 'passed',   dur: 600,  idx: 0 },
    { kind: 'stat',     dur: 700,  idx: 5 },
    { kind: 'topics',   dur: 1000, idx: 0 },
    { kind: 'budget',   dur: 1100, idx: 0 },
    { kind: 'stat',     dur: 600,  idx: 0 },
    { kind: 'quote',    dur: 800,  idx: 2 },
    { kind: 'map',      dur: 1100, idx: 0 },
    { kind: 'donut',    dur: 950,  idx: 0 },
    { kind: 'stat',     dur: 600,  idx: 1 },
    { kind: 'trends',   dur: 1200, idx: 0 },
    { kind: 'timer',    dur: 900,  idx: 0 },
    { kind: 'quote',    dur: 800,  idx: 3 },
    { kind: 'stat',     dur: 600,  idx: 2 },
    { kind: 'passed',   dur: 550,  idx: 0 },
    { kind: 'stat',     dur: 700,  idx: 4 },
    { kind: 'roll',     dur: 950,  idx: 1 }
  ];

  var builders = {
    tally:    ShotVoteTally,
    roll:     ShotRollCall,
    passed:   ShotMotionPassed,
    budget:   ShotBudget,
    topics:   ShotTopics,
    timer:    ShotTimer,
    map:      ShotMap,
    quote:    ShotQuote,
    donut:    ShotDonut,
    timeline: ShotTimeline,
    stat:     ShotStat,
    trends:   ShotTrends
  };

  // Pre-build each shot's DOM once so we just swap roots each cut.
  var shots = [];
  for (var si = 0; si < SHOT_LIST.length; si++) {
    var entry = SHOT_LIST[si];
    shots.push(builders[entry.kind](entry.idx || 0));
  }

  // Cut flash overlay — peaks at 12% PRIMARY for the first 4% of each shot.
  var flash = document.createElement('div');
  flash.className = 'mg-flash';
  mount.appendChild(flash);

  var current = -1;
  function setShot(i) {
    if (current >= 0 && shots[current].root.parentNode) {
      shots[current].root.parentNode.removeChild(shots[current].root);
    }
    current = i;
    mount.insertBefore(shots[i].root, flash);
    mount.dataset.shot = SHOT_LIST[i].kind;
  }

  // Reference defaults: tempo=1, jitter=true (subtle ±2px camera shake).
  var TEMPO = 1;
  var JITTER = true;
  var startTime = 0;
  var shotIdx = 0;
  var rafId = null;
  var elapsedBeforePause = 0;

  function loop(ts) {
    if (startTime === 0) {
      startTime = ts - elapsedBeforePause;
      if (current !== shotIdx) setShot(shotIdx);
    }
    var dur = SHOT_LIST[shotIdx].dur / TEMPO;
    var elapsed = ts - startTime;
    if (elapsed >= dur) {
      shotIdx = (shotIdx + 1) % SHOT_LIST.length;
      startTime = ts;
      elapsedBeforePause = 0;
      setShot(shotIdx);
      elapsed = 0;
    }
    var p = Math.min(1, elapsed / dur);
    shots[shotIdx].update(p);
    flash.style.opacity = p < 0.04 ? (0.12 * (1 - p / 0.04)).toFixed(3) : '0';
    if (JITTER) {
      var jx = (Math.random() - 0.5) * 2;
      var jy = (Math.random() - 0.5) * 2;
      shots[shotIdx].root.style.transform = 'translate(' + jx.toFixed(2) + 'px,' + jy.toFixed(2) + 'px)';
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (rafId != null) return;
    startTime = 0;
    rafId = requestAnimationFrame(loop);
  }
  function stop() {
    if (rafId != null) {
      if (startTime) elapsedBeforePause = Math.max(0, performance.now() - startTime);
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Reduced-motion fallback: park on the agenda shot at p=0 so the frame
  // reads as a calm static composition rather than a partial state.
  function freezeRestful() {
    stop();
    var pickIdx = 0;
    for (var i = 0; i < SHOT_LIST.length; i++) {
      if (SHOT_LIST[i].kind === 'topics') { pickIdx = i; break; }
    }
    shotIdx = pickIdx;
    elapsedBeforePause = 0;
    startTime = 0;
    setShot(pickIdx);
    shots[pickIdx].update(0);
    flash.style.opacity = '0';
    shots[pickIdx].root.style.transform = '';
  }

  var rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var inView = true;
  var userPaused = false;

  function decide() {
    if (rmq.matches) {
      freezeRestful();
    } else if (userPaused || document.hidden || !inView) {
      stop();
      flash.style.opacity = '0';
    } else {
      start();
    }
    mount.dataset.motion = rafId == null ? 'paused' : 'playing';
  }

  // The page owns the visible, keyboard-operable button and its pressed state.
  // A reduced-motion preference always wins over an external play request.
  document.addEventListener('politic:toggle-motion', function(event) {
    if (!event.detail || typeof event.detail.paused !== 'boolean') return;
    userPaused = event.detail.paused;
    decide();
  });

  if (rmq.addEventListener) rmq.addEventListener('change', decide);
  else if (rmq.addListener) rmq.addListener(decide);
  document.addEventListener('visibilitychange', decide);

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        inView = entries[i].isIntersecting;
      }
      decide();
    }, { threshold: 0 });
    io.observe(mount);
  }

  // Give a paused or initially offscreen mount a complete fallback composition.
  freezeRestful();
  if (!rmq.matches) {
    shotIdx = 0;
    setShot(0);
    shots[0].update(1);
  }
  decide();
})();
