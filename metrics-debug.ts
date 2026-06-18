import Hero from '@ulixee/hero-playground';
(async () => {
  const hero = new Hero({ showChrome: false });
  await hero.goto('https://x.com/search?q=%23codeable&src=typed_query&f=live');
  await hero.waitForPaintingStable();
  await new Promise(r => setTimeout(r, 5000));

  const tweets = hero.document.querySelectorAll('article[data-testid="tweet"]');
  const count = await tweets.length;
  console.log('Total tweets:', count);

  if (count > 0) {
    const firstTweet = tweets.item(0);
    console.log('\n=== FIRST TWEET INSPECTION ===\n');
    const outer = await firstTweet.outerHTML;
    console.log('HTML length:', outer.length);
    console.log('First 2000 chars:', outer.slice(0, 2000));
    
    const buttons = firstTweet.querySelectorAll('button, div[role="button"], div[data-testid]');
    const btnCount = await buttons.length;
    console.log('\nButtons/interactive elements:', btnCount);
    for (let i = 0; i < Math.min(20, btnCount); i++) {
      const btn = buttons.item(i);
      const testid = await btn.getAttribute('data-testid');
      const role = await btn.getAttribute('role');
      const text = await btn.textContent;
      const ariaLabel = await btn.getAttribute('aria-label');
      console.log(`btn ${i}: testid="${testid}" role="${role}" ariaLabel="${ariaLabel}" text="${text?.trim().slice(0, 50)}"`);
    }

    const divs = firstTweet.querySelectorAll('div[data-testid]');
    const divCount = await divs.length;
    console.log('\nData-testid divs:', divCount);
    for (let i = 0; i < Math.min(30, divCount); i++) {
      const div = divs.item(i);
      const testid = await div.getAttribute('data-testid');
      console.log(`div ${i}: "${testid}"`);
    }
  }

  await hero.close();
})();
