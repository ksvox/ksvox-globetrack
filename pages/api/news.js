/**
 * 音楽ニュース取得API(外部の変換サービスを使わず、アプリ自身がRSSを読みに行く)
 * GET /api/news
 * 1つのサイトが止まっても、他のサイトのニュースは表示される作り
 */

// ニュースの取得先。止まったサイトはここから外す/追加するだけでOK
const FEEDS = [
  { name: 'NME Japan', url: 'https://nme-jp.com/feed/', max: 8 },
  { name: '音楽ナタリー', url: 'https://natalie.mu/music/feed/news', max: 8 },
];

const CACHE_TTL = 30 * 60 * 1000;
let cache = null;

function decode(str) {
  return String(str || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? decode(m[1]) : '';
}

function parseFeed(xml, name, max) {
  const items = [];
  // RSS形式(<item>)
  const rssItems = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  rssItems.forEach((b) => {
    const title = pick(b, 'title');
    const link = pick(b, 'link');
    if (title && link) items.push({ source: name, title, link });
  });
  // Atom形式(<entry>)にも対応
  if (!items.length) {
    const entries = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
    entries.forEach((b) => {
      const title = pick(b, 'title');
      const lm = b.match(/<link[^>]*href="([^"]+)"/i);
      if (title && lm) items.push({ source: name, title, link: lm[1] });
    });
  }
  return items.filter((i) => /^https?:\/\//.test(i.link)).slice(0, max);
}

async function loadFeed(f) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(f.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (GlobeTrack; ksvox.net)' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseFeed(await res.text(), f.name, f.max);
  } catch (e) {
    console.warn('news feed notice:', f.name, e.message);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return res.status(200).json({ items: cache.items });
  }

  const lists = await Promise.all(FEEDS.map(loadFeed));
  const items = lists.flat();

  if (items.length) {
    cache = { ts: Date.now(), items };
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
  } else if (cache) {
    return res.status(200).json({ items: cache.items });
  }
  return res.status(200).json({ items });
}
