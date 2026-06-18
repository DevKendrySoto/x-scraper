import 'dotenv/config';
import Hero from '@ulixee/hero-playground';

const email = process.env.X_EMAIL;
const password = process.env.X_PASSWORD;

async function findButtonByText(buttons: any, includeText: string): Promise<any> {
  const count = await buttons.length;
  for (let i = 0; i < count; i++) {
    const button = buttons.item(i);
    const text = (await button.textContent)?.trim() ?? '';
    if (text.includes(includeText) && !text.includes('Continue with')) return button;
  }
  return null;
}

(async () => {
  const hero = new Hero({ showChrome: false });
  await hero.goto('https://x.com/login');
  await hero.waitForPaintingStable();

  const emailInput = hero.document.querySelector('input[name="username_or_email"]');
  await emailInput.$waitForExists({ timeoutMs: 30000 });
  await hero.interact({ click: emailInput }, { type: email });

  const buttons = hero.document.querySelectorAll('button');
  const continueButton = await findButtonByText(buttons, 'Continue');
  if (continueButton) await hero.interact({ click: continueButton });

  await hero.waitForPaintingStable();
  await new Promise(resolve => setTimeout(resolve, 3000));

  const pwInputs = hero.document.querySelectorAll('input[type="password"]');
  const count = await pwInputs.length;
  let pwInput = null;
  for (let i = 0; i < count; i++) {
    const input = pwInputs.item(i);
    const style = (await input.getAttribute('style')) ?? '';
    if (!style.includes('opacity: 0')) {
      pwInput = input;
      break;
    }
  }
  if (!pwInput) pwInput = pwInputs.item(0);

  await hero.interact({ click: pwInput }, { type: password });

  const loginButtons = hero.document.querySelectorAll('button');
  const loginButton = await findButtonByText(loginButtons, 'Log in') ?? await findButtonByText(loginButtons, 'Login');
  if (loginButton) await hero.interact({ click: loginButton });

  await new Promise(resolve => setTimeout(resolve, 5000));

  const searchUrl = `https://x.com/search?q=%23codeable&src=typed_query&f=live`;
  await hero.goto(searchUrl);
  await hero.waitForPaintingStable();
  await new Promise(r => setTimeout(r, 5000));

  const tweets = hero.document.querySelectorAll('article[data-testid="tweet"]');
  const tweetsCount = await tweets.length;

  if (tweetsCount > 0) {
    const firstTweet = tweets.item(0);
    const divs = firstTweet.querySelectorAll('div[data-testid], button[data-testid]');
    const divCount = await divs.length;
    console.log('All data-testid values:');
    const testedIds = new Set();
    for (let i = 0; i < divCount; i++) {
      const div = divs.item(i);
      const testid = await div.getAttribute('data-testid');
      if (testid && !testedIds.has(testid)) {
        testedIds.add(testid);
        console.log(`  "${testid}"`);
      }
    }

    console.log('\nSearching for "views", "view", "seen" patterns...');
    const all = firstTweet.querySelectorAll('*');
    const allCount = await all.length;
    for (let i = 0; i < allCount; i++) {
      const el = all.item(i);
      const testid = await el.getAttribute('data-testid');
      const ariaLabel = await el.getAttribute('aria-label');
      const text = await el.textContent;
      if ((text && (text.includes('view') || text.includes('View') || text.includes('seen'))) || 
          (ariaLabel && (ariaLabel.includes('view') || ariaLabel.includes('View')))) {
        console.log(`FOUND: testid="${testid}" ariaLabel="${ariaLabel}" text="${text?.trim().slice(0, 80)}"`);
      }
    }
  }

  await hero.close();
})();
