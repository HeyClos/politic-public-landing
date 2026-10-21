// Politic Public editorial motion. One fictional agenda item becomes a useful record.
// Play once, hold the complete brief, and let the reader replay.
(function () {
  'use strict';

  var mount = document.getElementById('heroMontage');
  var button = document.getElementById('motion-toggle');
  if (!mount || !button) return;

  var SCENE_DURATION = 4200;
  var FADE_DURATION = 400;
  var REVEAL_DURATION = 1000;
  var TOTAL_DURATION = SCENE_DURATION * 3;
  var stillPreview = new URLSearchParams(window.location.search).get('still') === '1';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  mount.classList.add('mg-montage');
  mount.dataset.treatment = 'editorial';
  mount.setAttribute('aria-hidden', 'true');

  function element(tag, className, text) {
    var node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function scene(kind, number, label) {
    var root = element('div', 'mg-shot mg-record-' + kind);
    root.appendChild(element('div', 'mg-meta mg-meta-left', number + ' / ' + label));
    return { kind: kind, root: root, update: function () {} };
  }

  // Text and figures are present from the first frame. Only the secondary
  // detail gains emphasis; there are no counters or typewriter effects.
  function revealDetail(item, detail) {
    item.update = function (progress) {
      var p = Math.max(0, Math.min(1, progress));
      var eased = p * p * (3 - 2 * p);
      detail.style.opacity = String(0.62 + 0.38 * eased);
    };
    return item;
  }

  function agendaScene() {
    var item = scene('topics', '01', 'On the agenda');
    var stack = element('div', 'mg-record-stack');
    stack.appendChild(element('p', 'mg-record-kicker', 'Land use / Housing proposal'));
    var topics = element('div', 'mg-topics');
    topics.appendChild(element('div', 'mg-topic', 'A housing proposal.'));
    topics.appendChild(element('div', 'mg-topic', 'A parking requirement.'));
    topics.appendChild(element('div', 'mg-topic', 'A condition to reconsider.'));
    stack.appendChild(topics);
    var detail = element('p', 'mg-record-detail', 'The item comes before the council.');
    stack.appendChild(detail);
    item.root.appendChild(stack);
    return revealDetail(item, detail);
  }

  function quoteScene() {
    var item = scene('quote', '02', 'In the meeting');
    var stack = element('div', 'mg-record-stack');
    stack.appendChild(element('p', 'mg-record-kicker', 'The amendment'));
    stack.appendChild(element('div', 'mg-quote', '\u201cI move to amend the parking requirement.\u201d'));
    var detail = element('p', 'mg-record-detail', 'Illustrative wording / A change to the condition.');
    stack.appendChild(detail);
    item.root.appendChild(stack);
    return revealDetail(item, detail);
  }

  function tallyScene() {
    var item = scene('tally', '03', 'The decision');
    var stack = element('div', 'mg-record-stack');
    stack.appendChild(element('p', 'mg-record-kicker', 'Vote on the parking amendment'));
    var tally = element('div', 'mg-tally');
    [['7', 'In favor'], ['2', 'Opposed'], ['1', 'Abstained']].forEach(function (vote) {
      var cell = element('div', 'mg-tally-cell');
      cell.appendChild(element('div', 'mg-tally-number', vote[0]));
      cell.appendChild(element('div', 'mg-tally-label', vote[1]));
      tally.appendChild(cell);
    });
    stack.appendChild(tally);
    var detail = element('p', 'mg-record-detail', 'The amendment carries.');
    stack.appendChild(detail);
    item.root.appendChild(stack);
    return revealDetail(item, detail);
  }

  function briefScene() {
    var item = scene('brief', '04', 'The useful record');
    var stack = element('div', 'mg-record-stack');
    stack.appendChild(element('p', 'mg-record-kicker', 'What changed'));
    stack.appendChild(element('h2', 'mg-record-title', 'Parking condition amended.'));
    stack.appendChild(element('p', 'mg-record-detail', 'The council changed the parking requirement attached to the housing proposal.'));
    stack.appendChild(element('div', 'mg-record-status', 'Final project approval remains pending.'));
    item.root.appendChild(stack);
    return item;
  }

  var scenes = [agendaScene(), quoteScene(), tallyScene(), briefScene()];
  var elapsed = 0;
  var lastTimestamp = null;
  var frame = null;
  var userPaused = false;
  var completed = false;
  var inView = !('IntersectionObserver' in window);
  var attached = '';

  function showRoots(index, withNext) {
    var key = String(index) + (withNext ? '+next' : '');
    if (attached === key) return;
    mount.replaceChildren(scenes[index].root);
    if (withNext) mount.appendChild(scenes[index + 1].root);
    attached = key;
  }

  function render() {
    if (elapsed >= TOTAL_DURATION) {
      showRoots(3, false);
      scenes[3].root.style.opacity = '1';
      mount.dataset.shot = 'brief';
      mount.dataset.phase = 'settled';
      return;
    }

    var index = Math.floor(elapsed / SCENE_DURATION);
    var localTime = elapsed - index * SCENE_DURATION;
    var fading = localTime >= SCENE_DURATION - FADE_DURATION;
    var fade = fading ? (localTime - SCENE_DURATION + FADE_DURATION) / FADE_DURATION : 0;
    showRoots(index, fading);
    scenes[index].root.style.opacity = String(1 - fade);
    scenes[index].update(localTime / REVEAL_DURATION);
    if (fading) {
      scenes[index + 1].root.style.opacity = String(fade);
      scenes[index + 1].update(0);
    }
    mount.dataset.shot = scenes[index].kind;
    mount.dataset.phase = fading ? 'transition' : localTime < REVEAL_DURATION ? 'reveal' : 'hold';
  }

  function cancelFrame() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTimestamp = null;
  }

  function updateControl() {
    var isStatic = stillPreview || reducedMotion.matches;
    button.disabled = isStatic;
    button.setAttribute('aria-pressed', String(userPaused && !completed && !isStatic));
    if (stillPreview) {
      button.textContent = 'Still preview';
      button.title = 'A still comparison of the completed meeting record.';
    } else if (reducedMotion.matches) {
      button.textContent = 'Motion reduced';
      button.title = 'The completed record is shown to respect your device motion preference.';
    } else {
      button.textContent = completed ? 'Replay' : userPaused ? 'Play' : 'Pause';
      button.title = completed ? 'Replay the illustrative meeting record.' : '';
    }
    mount.dataset.motion = isStatic || userPaused || document.hidden || !inView
      ? 'paused' : completed ? 'complete' : 'playing';
    if (completed && !isStatic) mount.dataset.motion = 'complete';
  }

  function tick(timestamp) {
    frame = null;
    if (lastTimestamp !== null) elapsed += timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    if (elapsed >= TOTAL_DURATION) {
      elapsed = TOTAL_DURATION;
      completed = true;
      lastTimestamp = null;
      render();
      updateControl();
      return;
    }
    render();
    frame = requestAnimationFrame(tick);
  }

  function decide() {
    if (stillPreview || reducedMotion.matches) {
      cancelFrame();
      elapsed = TOTAL_DURATION;
      completed = true;
      userPaused = false;
      render();
    } else if (completed || userPaused || document.hidden || !inView) {
      cancelFrame();
    } else if (frame === null) {
      lastTimestamp = null;
      frame = requestAnimationFrame(tick);
    }
    updateControl();
  }

  button.addEventListener('click', function () {
    if (stillPreview || reducedMotion.matches) return;
    if (completed) {
      elapsed = 0;
      completed = false;
      userPaused = false;
      render();
    } else {
      userPaused = !userPaused;
    }
    decide();
  });

  document.addEventListener('visibilitychange', decide);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', decide);
  else reducedMotion.addListener(decide);

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { inView = entry.isIntersecting; });
      decide();
    }, { threshold: 0 });
    observer.observe(mount);
  }

  render();
  decide();
})();
