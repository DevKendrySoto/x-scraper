import "dotenv/config";
import Hero from "@ulixee/hero-playground";

const rawHashtag = process.argv[2] ?? process.env.HASHTAG;
const hashtag = rawHashtag?.toString().replace(/^#/, "").trim();
const email = process.env.X_EMAIL;
const password = process.env.X_PASSWORD;

if (!email) throw new Error("X_EMAIL is required in .env");
if (!password) throw new Error("X_PASSWORD is required in .env");
if (!hashtag) {
  throw new Error("HASHTAG is required. Use: npx ts-node index.ts <tag> or set HASHTAG in .env");
}

function normalizeText(value: string | null | undefined): string {
  return value?.toString().trim() ?? "";
}

async function safeText(el: any): Promise<string | null> {
  if (!el) return null;
  try {
    const v = await el.textContent;
    return v ?? null;
  } catch (err) {
    return null;
  }
}

async function findButtonByText(buttons: any, includeText: string, excludeText?: string): Promise<any> {
  const count = await buttons.length;
  for (let i = 0; i < count; i++) {
    const button = buttons.item(i);
    const raw = await safeText(button);
    const text = normalizeText(raw);
    if (!text) continue;
    if (excludeText && text.includes(excludeText)) continue;
    if (text.includes(includeText)) return button;
  }
  return null;
}

async function findVisiblePasswordInput(document: any): Promise<any> {
  const inputs = document.querySelectorAll('input[type="password"]');
  const count = await inputs.length;
  for (let i = 0; i < count; i++) {
    const input = inputs.item(i);
    const ariaHidden = normalizeText(await input.getAttribute('aria-hidden'));
    const style = normalizeText(await input.getAttribute('style'));
    if (ariaHidden === 'true') continue;
    if (style.includes('opacity: 0') || style.includes('pointer-events: none')) continue;
    return input;
  }
  return count > 0 ? inputs.item(0) : null;
}

interface TweetData {
  author: string;
  datetime: string;
  text: string;
  likes: string;
  replies: string;
  retweets: string;
  bookmarks: string;
  views: string;
}

async function extractTweet(tweet: any): Promise<TweetData> {
  const textEl = tweet.querySelector('[data-testid="tweetText"]') ?? tweet.querySelector('div[lang]');
  const authorEl = tweet.querySelector('[data-testid="User-Name"]');
  const timeEl = tweet.querySelector('time');

  const likeEl = tweet.querySelector('[data-testid="like"]');
  const replyEl = tweet.querySelector('[data-testid="reply"]');
  const retweetEl = tweet.querySelector('[data-testid="retweet"]');
  const bookmarkEl = tweet.querySelector('[data-testid="bookmark"]');
  const viewEl = tweet.querySelector('[data-testid="view"]');

  const textRaw = await safeText(textEl);
  const authorRaw = await safeText(authorEl);
  const likesRaw = await safeText(likeEl);
  const repliesRaw = await safeText(replyEl);
  const retweetsRaw = await safeText(retweetEl);
  const bookmarksRaw = await safeText(bookmarkEl);
  const viewsRaw = await safeText(viewEl);

  return {
    text: textRaw ? normalizeText(textRaw) : '[text not found]',
    author: authorRaw ? normalizeText(authorRaw) : '[author not found]',
    datetime: timeEl ? normalizeText(await timeEl.getAttribute('datetime')) : '[time not found]',
    likes: likesRaw ? normalizeText(likesRaw) : '0',
    replies: repliesRaw ? normalizeText(repliesRaw) : '0',
    retweets: retweetsRaw ? normalizeText(retweetsRaw) : '0',
    bookmarks: bookmarksRaw ? normalizeText(bookmarksRaw) : '0',
    views: viewsRaw ? normalizeText(viewsRaw) : '—',
  };
}

async function getStatusPath(tweet: any): Promise<string | null> {
  const anchors = tweet.querySelectorAll('a[href*="/status/"]');
  const count = await anchors.length;
  for (let i = 0; i < count; i++) {
    const href = normalizeText(await anchors.item(i).getAttribute('href'));
    // canonical permalink ends in /status/<digits> (avoid /analytics, /photo, etc.)
    if (/\/status\/\d+$/.test(href)) return href;
  }
  return null;
}

(async () => {
  const hero = new Hero({ showChrome: true });
  console.log(`Starting login for ${email}`);
  await hero.goto('https://x.com/login');
  await hero.waitForPaintingStable();

  const emailInput = hero.document.querySelector('input[name="username_or_email"]');
  await emailInput.$waitForExists({ timeoutMs: 30000 });
  await hero.interact({ click: emailInput }, { type: email });
  console.log('Email entered');

  const buttons = hero.document.querySelectorAll('button');
  const continueButton = await findButtonByText(buttons, 'Continue', 'Continue with');
  if (!continueButton) throw new Error('Could not find the login Continue button');
  await hero.interact({ click: continueButton });
  console.log('Clicked Continue');

  await hero.waitForPaintingStable();
  await new Promise(resolve => setTimeout(resolve, 3000));

  const passwordInput = await findVisiblePasswordInput(hero.document);
  if (!passwordInput) {
    throw new Error('Could not locate a visible password input after clicking Continue');
  }

  await hero.interact({ click: passwordInput }, { type: password });
  console.log('Password entered');

  const loginButtons = hero.document.querySelectorAll('button');
  const loginButton = await findButtonByText(loginButtons, 'Log in') ?? await findButtonByText(loginButtons, 'Login') ?? await findButtonByText(loginButtons, 'Continue');
  if (!loginButton) throw new Error('Could not find the login button after password entry');
  await hero.interact({ click: loginButton });
  console.log('Clicked login');

  const beforeSearchId = await hero.lastCommandId;
  try {
    await hero.activeTab.waitForLocation('change', { sinceCommandId: beforeSearchId, timeoutMs: 20000 });
  } catch (error) {
    console.warn('Login did not redirect immediately, continuing with current session');
  }

  const searchUrl = `https://x.com/search?q=%23${encodeURIComponent(hashtag)}&src=typed_query&f=live`;
  console.log(`Searching hashtag: #${hashtag}`);
  await hero.goto(searchUrl);
  await hero.waitForPaintingStable();
  await new Promise(resolve => setTimeout(resolve, 3000));

  const firstTweet = hero.document.querySelector('article[data-testid="tweet"]');
  await firstTweet.$waitForExists({ timeoutMs: 20000 });

  const tweets = hero.document.querySelectorAll('article[data-testid="tweet"]');
  const total = await tweets.length;
  const max = Math.min(5, total);

  console.log(`Found ${total} tweets, showing latest ${max}\n`);

  // Collect main posts + their permalinks while still on the search page,
  // because navigating to a post detail discards the results list.
  const posts: Array<{ data: TweetData; path: string | null }> = [];
  for (let i = 0; i < max; i++) {
    const tweet = tweets.item(i);
    posts.push({
      data: await extractTweet(tweet),
      path: await getStatusPath(tweet),
    });
  }

  const MAX_COMMENTS = 5;
  const MIN_COMMENTS = 3;

  for (let i = 0; i < posts.length; i++) {
    const { data, path } = posts[i];

    console.log(`Tweet ${i + 1}`);
    console.log(`  author: ${data.author}`);
    console.log(`  date:   ${data.datetime}`);
    console.log(`  text:   ${data.text}`);
    console.log(`  Metrics:`);
    console.log(`    likes:     ${data.likes}`);
    console.log(`    replies:   ${data.replies}`);
    console.log(`    retweets:  ${data.retweets}`);
    console.log(`    bookmarks: ${data.bookmarks}`);
    console.log(`    views:     ${data.views}`);

    if (!path) {
      console.log(`  Comments: [permalink not found, skipping]\n`);
      continue;
    }

    // Visit the post detail to read its replies.
    await hero.goto(`https://x.com${path}`);
    await hero.waitForPaintingStable();
    await new Promise(resolve => setTimeout(resolve, 3000));

    const replyArticles = hero.document.querySelectorAll('article[data-testid="tweet"]');
    const replyCount = await replyArticles.length;

    // Index 0 is the main post itself; replies follow.
    const commentsToShow = Math.min(MAX_COMMENTS, Math.max(0, replyCount - 1));
    console.log(`  Comments (${commentsToShow}):`);

    if (commentsToShow < MIN_COMMENTS) {
      console.log(`    [only ${commentsToShow} comment(s) available]`);
    }

    for (let j = 1; j <= commentsToShow; j++) {
      const comment = await extractTweet(replyArticles.item(j));
      console.log(`    Comment ${j}`);
      console.log(`      author: ${comment.author}`);
      console.log(`      date:   ${comment.datetime}`);
      console.log(`      text:   ${comment.text}`);
      console.log(`      likes:  ${comment.likes} | replies: ${comment.replies} | retweets: ${comment.retweets}`);
    }
    console.log('');
  }

  await hero.close();
  console.log('Done');
})();
