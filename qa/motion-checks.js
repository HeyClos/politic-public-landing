async page => {
  const checks = [], errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const assert = (ok, label) => { if (!ok) throw new Error(label); checks.push(label); };
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('http://127.0.0.1:4173/');
  await page.evaluate(() => document.fonts.ready);
  const mount = page.locator('#heroMontage');
  await page.waitForFunction(() => document.getElementById('heroMontage').dataset.motion === 'playing');
  assert(await mount.getAttribute('data-treatment') === 'editorial', 'Main page uses the selected editorial treatment');
  assert(!await page.locator('script[src="assets/montage.js"]').count(), 'Main page does not load the previous montage controller');
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  const paused = await mount.innerHTML();
  await page.waitForTimeout(250);
  assert(await mount.innerHTML() === paused, 'Pause freezes the exact frame');
  await page.getByRole('button',{name:'Play',exact:true}).click();
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.getElementById('heroMontage').dataset.motion === 'paused');
  const offscreen = await mount.innerHTML();
  await page.waitForTimeout(250);
  assert(await mount.innerHTML() === offscreen, 'Offscreen playback is suspended');
  await page.locator('.site-header').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.getElementById('heroMontage').dataset.motion === 'playing');
  for (const kind of ['quote','tally','brief']) {
    await page.waitForFunction(k => document.getElementById('heroMontage').dataset.shot === k, kind, {timeout:7000});
    assert(await page.locator('.mg-shot').last().evaluate(el => getComputedStyle(el).transform) === 'none', kind + ' stays steady');
  }
  assert(await mount.getAttribute('data-motion') === 'complete', 'Sequence completes once');
  await page.waitForTimeout(500);
  assert(await mount.getAttribute('data-shot') === 'brief', 'Complete brief stays on screen');
  assert(await page.getByRole('button',{name:'Replay',exact:true}).isVisible(), 'Replay is available after completion');
  await page.screenshot({path:'brand/landing-hero.png'});
  await page.screenshot({path:'brand/landing-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'Replay',exact:true}).click();
  assert(await mount.getAttribute('data-shot') === 'topics', 'Replay starts from the agenda');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(() => document.getElementById('motion-toggle').disabled);
  assert(await mount.getAttribute('data-shot') === 'brief', 'Reduced motion presents the complete brief immediately');
  assert(await mount.getAttribute('data-motion') === 'paused', 'Reduced-motion state is still');
  for (const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({width,height:width===390?844:1000});
    const layout = await page.evaluate(() => {
      const frame=document.getElementById('heroMontage').getBoundingClientRect();
      const body=document.querySelector('.mg-record-stack').getBoundingClientRect();
      return {fits:body.top>=frame.top&&body.bottom<=frame.bottom&&body.left>=frame.left&&body.right<=frame.right,
        overflow:document.documentElement.scrollWidth>innerWidth,
        loaded:[...document.images].every(image=>image.complete&&image.naturalWidth)};
    });
    assert(layout.fits&&!layout.overflow&&layout.loaded,'Record and identity fit at '+width+'px');
    if (width===390) {
      await page.screenshot({path:'brand/landing-mobile-hero.png'});
      await page.screenshot({path:'brand/landing-mobile.png',fullPage:true});
    }
  }
  await page.goto('http://127.0.0.1:4173/motion-preview.html?still=1');
  await page.waitForURL('**/index.html?still=1');
  assert(await mount.getAttribute('data-shot') === 'brief', 'Earlier preview link redirects to the selected page and preserves still mode');
  await page.goto('http://127.0.0.1:4173/brand/motion-study.html');
  await page.getByRole('button',{name:'Previous montage',exact:true}).click();
  assert(await page.locator('#study-frame').getAttribute('src') === 'archive/original-motion.html', 'Comparison links to the archived montage');
  await page.getByRole('button',{name:'Calmer sequence',exact:true}).click();
  assert(await page.locator('#study-frame').getAttribute('src') === '../index.html', 'Comparison points to the final main page');
  await page.goto('http://127.0.0.1:4173/brand/strategy.html');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({path:'brand/brand-guide-desktop.png',fullPage:true});
  assert(errors.length===0,'No JavaScript errors');
  return {passed:checks.length,checks,errors};
}
