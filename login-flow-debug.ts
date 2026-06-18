import Hero from '@ulixee/hero-playground';
(async () => {
  const hero = new Hero({ showChrome: false });
  await hero.goto('https://x.com/login');
  await hero.waitForPaintingStable();
  await new Promise(r => setTimeout(r, 5000));

  const username = hero.document.querySelector('input[name="username_or_email"]');
  await username.$waitForExists({ timeoutMs: 20000 });
  await hero.interact({ click: username }, { type: 'test@example.com' });
  console.log('typed email');

  const continueBtn = Array.from(await hero.document.querySelectorAll('button')).find(async (btn) => {
    const text = await btn.textContent;
    return text?.trim().startsWith('Continue');
  });
  console.log('continueBtn found', !!continueBtn);
  if (continueBtn) {
    const outer = await continueBtn.outerHTML;
    console.log('continueBtn outer', outer.slice(0, 400));
    await hero.interact({ click: continueBtn });
    console.log('clicked continue');
  }

  await hero.waitForPaintingStable();
  await new Promise(r => setTimeout(r, 8000));

  const pwInputs = hero.document.querySelectorAll('input[type="password"]');
  console.log('password inputs', await pwInputs.length);
  for (let i = 0; i < await pwInputs.length; i++) {
    const el = pwInputs.item(i);
    console.log('pw input', i, {
      id: await el.getAttribute('id'),
      name: await el.getAttribute('name'),
      type: await el.getAttribute('type'),
      style: await el.getAttribute('style'),
      ariaHidden: await el.getAttribute('aria-hidden'),
      tabindex: await el.getAttribute('tabindex'),
      value: await el.getAttribute('value'),
    });
    console.log('outer', (await el.outerHTML).slice(0, 400));
  }

  const textboxes = hero.document.querySelectorAll('[role="textbox"], [role="searchbox"], input');
  console.log('textboxes', await textboxes.length);
  for (let i = 0; i < Math.min(20, await textboxes.length); i++) {
    const el = textboxes.item(i);
    console.log('box', i, {
      tag: await el.tagName,
      role: await el.getAttribute('role'),
      id: await el.getAttribute('id'),
      name: await el.getAttribute('name'),
      type: await el.getAttribute('type'),
      placeholder: await el.getAttribute('placeholder'),
      ariaHidden: await el.getAttribute('aria-hidden'),
      style: await el.getAttribute('style'),
      value: await el.getAttribute('value'),
      text: (await el.textContent)?.trim().slice(0,100),
    });
    console.log('outer', (await el.outerHTML).slice(0, 400));
  }

  const buttons2 = hero.document.querySelectorAll('button');
  console.log('buttons after continue', await buttons2.length);
  for (let i = 0; i < await buttons2.length; i++) {
    const btn = buttons2.item(i);
    const text = await btn.textContent;
    console.log('button', i, { text: text?.trim(), role: await btn.getAttribute('role') });
  }

  const html = await hero.document.documentElement.outerHTML;
  console.log('page html head', html.slice(0, 1000));
  await hero.close();
})();
