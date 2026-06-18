import 'dotenv/config';
import Hero from '@ulixee/hero-playground';

(async () => {
  const hero = new Hero({ showChrome: false });
  const url = 'https://x.com/search?q=%23codeable&src=typed_query&f=live';
  console.log('goto', url);
  await hero.goto(url);
  await hero.waitForPaintingStable();
  await new Promise((resolve) => setTimeout(resolve, 10000));
  const html = await hero.document.documentElement.outerHTML;
  console.log('url', await hero.url);
  const articleCount = await hero.document.querySelectorAll('article').length;
  const tweetCount = await hero.document.querySelectorAll('article[data-testid="tweet"]').length;
  console.log('articles', articleCount, 'tweetArticles', tweetCount);
  const articles = hero.document.querySelectorAll('article');
  const max = Math.min(5, await articles.length);
  for (let i = 0; i < max; i++) {
    const article = articles.item(i);
    const outer = await article.outerHTML;
    console.log('article', i, outer.slice(0, 400));
  }
  await hero.close();
})();
