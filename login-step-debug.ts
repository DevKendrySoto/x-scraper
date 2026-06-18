import Hero from '@ulixee/hero-playground';
(async () => {
  const hero = new Hero({ showChrome: false });
  await hero.goto('https://x.com/login');
  await hero.waitForPaintingStable();
  const username = hero.document.querySelector('input[name="username_or_email"]');
  await username.$waitForExists({ timeoutMs: 20000 });
  await hero.interact({ click: username }, { type: 'test@example.com' }, { type: 'Enter' });
  console.log('typed email and enter');
  await hero.waitForPaintingStable();
  await new Promise((resolve) => setTimeout(resolve, 8000));
  const inputs = hero.document.querySelectorAll('input');
  console.log('inputs', await inputs.length);
  for (let i = 0; i < await inputs.length; i++) {
    const el = inputs.item(i);
    const attrs = {
      name: await el.getAttribute('name'),
      id: await el.getAttribute('id'),
      type: await el.getAttribute('type'),
      placeholder: await el.getAttribute('placeholder'),
      value: await el.getAttribute('value'),
      style: await el.getAttribute('style'),
    };
    console.log('input', i, attrs);
  }
  const buttons = hero.document.querySelectorAll('button,div[role="button"],a[role="button"]');
  console.log('buttons', await buttons.length);
  for (let i = 0; i < await buttons.length; i++) {
    const btn = buttons.item(i);
    const text = await btn.textContent;
    const role = await btn.getAttribute('role');
    console.log('button', i, { text: text?.trim(), role });
  }
  await hero.close();
})();
