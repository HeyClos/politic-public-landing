(() => {
  'use strict';
  const dialog = document.getElementById('signup-dialog');
  const form = document.getElementById('signup-form');
  const content = document.getElementById('signup-content');
  const success = document.getElementById('signup-success');
  const submit = document.getElementById('signup-submit');
  const error = document.getElementById('form-error');
  let opener;
  let completed = false;
  document.querySelectorAll('[data-open-signup]').forEach(button => button.addEventListener('click', () => {
    opener = button;
    if (completed) {
      form.reset(); completed = false;
      content.hidden = false; success.hidden = true;
      dialog.setAttribute('aria-labelledby', 'signup-title');
      dialog.setAttribute('aria-describedby', 'signup-description');
    }
    error.textContent = '';
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  const close = () => dialog.close();
  dialog.querySelector('.dialog-close').addEventListener('click', close);
  dialog.querySelector('[data-close-signup]').addEventListener('click', close);
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    opener?.focus();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || submit.disabled) return;
    const data = new FormData(form);
    const payload = {
      name: data.get('name').trim(), email: data.get('email').trim(),
      company: data.get('company').trim(), role: data.get('role'),
      topics: data.getAll('topics'), zip: data.get('zip').trim() || null,
      website: data.get('website'), source_url: window.location.href
    };
    error.textContent = '';
    submit.disabled = true;
    submit.textContent = 'Sending…';
    try {
      const response = await fetch('/api/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) {
        if (response.status === 429) throw new Error('Please wait a minute, then try again.');
        if (response.status === 404 || response.status === 501) throw new Error('This preview is not connected to signup. Please request access at politicpublic.com.');
        throw new Error('We couldn’t send your request. Please try again, or use Get in touch below.');
      }
      const result = await response.json();
      if (result.ok !== true) throw new Error('We couldn’t confirm your request. Please try again.');
      completed = true;
      content.hidden = true;
      success.hidden = false;
      const successTitle = success.querySelector('h2');
      successTitle.id = 'signup-success-title';
      dialog.setAttribute('aria-labelledby', 'signup-success-title');
      dialog.removeAttribute('aria-describedby');
      successTitle.focus();
      window.posthog?.capture('request_access_submitted');
    } catch (err) {
      error.textContent = err.name === 'TimeoutError' ? 'The request took too long. Please try again.' : (err instanceof TypeError ? 'Connection interrupted. Please try again.' : err.message);
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Send request <span aria-hidden="true">↗</span>';
    }
  });
  // The editorial controller owns finite playback and the Replay control.
  if (document.getElementById('heroMontage')?.dataset.treatment === 'editorial') return;
  const motionButton = document.getElementById('motion-toggle');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduceMotion.matches;
  function reflectMotion() {
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.innerHTML = paused ? '<span aria-hidden="true">▷</span> Play' : '<span aria-hidden="true">Ⅱ</span> Pause';
    if (reduceMotion.matches) {
      motionButton.textContent = 'Motion reduced';
      motionButton.disabled = true;
      motionButton.title = 'Animation is paused to respect your device motion preference.';
    } else { motionButton.disabled = false; motionButton.title = ''; }
  }
  motionButton.addEventListener('click', () => {
    paused = !paused;
    document.dispatchEvent(new CustomEvent('politic:toggle-motion', {detail:{paused}}));
    reflectMotion();
  });
  reduceMotion.addEventListener('change', () => {
    paused = reduceMotion.matches;
    document.dispatchEvent(new CustomEvent('politic:toggle-motion', {detail:{paused}}));
    reflectMotion();
  });
  reflectMotion();
})();
