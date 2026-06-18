import Hero from '@ulixee/hero-playground';
(async () => {
  const hero = new Hero({ showChrome: false });
  await hero.goto('https://x.com/login');
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
    };
    const outer = await el.outerHTML;
    console.log('input', i, attrs, outer.slice(0, 300));
  }

  const buttons = hero.document.querySelectorAll('button,div[role="button"],a[role="button"]');
  console.log('buttons', await buttons.length);
  for (let i = 0; i < await buttons.length; i++) {
    const btn = buttons.item(i);
    const text = await btn.textContent;
    const role = await btn.getAttribute('role');
    const outer = await btn.outerHTML;
    console.log('button', i, { text: text?.trim(), role, outer: outer.slice(0, 400) });
  }

  const labels = hero.document.querySelectorAll('label');
  console.log('labels', await labels.length);
  for (let i = 0; i < await labels.length; i++) {
    const label = labels.item(i);
    console.log('label', i, await label.textContent, await label.outerHTML.slice(0, 200));
  }

  await hero.close();
})();
