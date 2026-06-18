import Hero from '@ulixee/hero-playground';
(async () => {
  const hero = new Hero({ showChrome: false });
  await hero.goto('https://x.com/login');
  await hero.waitForPaintingStable();
  const emailInput = hero.document.querySelector('input[name="username_or_email"]');
  await emailInput.$waitForExists({ timeoutMs: 20000 });
  await hero.interact({ click: emailInput }, { type: 'test@example.com' });
  const continueButtons = hero.document.querySelectorAll('button');
  const continueButton = Array.from(await continueButtons).find(async (btn) => {
    const text = (await btn.textContent)?.trim();
    return text === 'Continue';
  });
  if (continueButton) await hero.interact({ click: continueButton });
  await hero.waitForPaintingStable();
  await new Promise((r) => setTimeout(r, 8000));

  const pwInputs = hero.document.querySelectorAll('input[type="password"]');
  console.log('password inputs count', await pwInputs.length);
  for (let i = 0; i < await pwInputs.length; i++) {
    const el = pwInputs.item(i);
    console.log('pw', i, {
      outer: (await el.outerHTML).slice(0, 200),
      ariaHidden: await el.getAttribute('aria-hidden'),
      style: await el.getAttribute('style'),
      id: await el.getAttribute('id'),
      name: await el.getAttribute('name'),
    });
  }
  const contentInputs = hero.document.querySelectorAll('[contenteditable="true"], [role="textbox"], [role="searchbox"]');
  console.log('contenteditable count', await contentInputs.length);
  for (let i = 0; i < await contentInputs.length; i++) {
    const el = contentInputs.item(i);
    console.log('content', i, {
      tag: await el.tagName,
      role: await el.getAttribute('role'),
      contenteditable: await el.getAttribute('contenteditable'),
      ariaHidden: await el.getAttribute('aria-hidden'),
      style: await el.getAttribute('style'),
      placeholder: await el.getAttribute('placeholder'),
      outer: (await el.outerHTML).slice(0, 200),
    });
  }
  const buttons = hero.document.querySelectorAll('button');
  for (let i = 0; i < await buttons.length; i++) {
    const btn = buttons.item(i);
    console.log('button', i, { text: (await btn.textContent)?.trim(), outer: (await btn.outerHTML).slice(0, 200) });
  }
  await hero.close();
})();
