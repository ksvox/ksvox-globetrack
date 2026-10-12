/**
 * GlobeTrack Ver2.0 - ランキング取得API
 * データ元:Apple Music「再生回数ランキング」(Apple公式の公開データ・APIキー不要)
 *
 * GET /api/chart?country=US&limit=20   … 1カ国分
 * GET /api/chart?country=ALL&limit=10  … 地図に出す全カ国分をまとめて(予備)
 */

// 地図に表示する国(フロントのCOUNTRIESと揃える)
const MAP_COUNTRIES = ['US', 'GB', 'FR', 'DE', 'JP', 'KR', 'BR', 'AU', 'IN', 'ZA', 'RU'];

// サーバー内の一時保存(8時間)。Appleのランキングは1日1回程度の更新のため、8時間ごとに取り直せば十分
const CACHE_TTL = 8 * 60 * 60 * 1000;
const cache = new Map();

// Appleのランキングは 10/25/50/100件 単位でしか取れないため、必要数以上の最小単位で取得して切り詰める
function feedSize(limit) {
  if (limit <= 10) return 10;
  if (limit <= 25) return 25;
  if (limit <= 50) return 50;
  return 100;
}

// 8秒で見切りをつける(1つの遅れが全体を待たせないように)
async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (GlobeTrack; ksvox.net)' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function getCountryChart(cc, limit) {
  const size = feedSize(limit);
  const key = `${cc}-${size}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.tracks.slice(0, limit);

  const lc = cc.toLowerCase();
  const urls = [
    `https://rss.marketingtools.apple.com/api/v2/${lc}/music/most-played/${size}/songs.json`,
    `https://rss.applemarketingtools.com/api/v2/${lc}/music/most-played/${size}/songs.json`,
  ];

  let results = null;
  for (const u of urls) {
    try {
      const data = await fetchJson(u);
      results = data.feed?.results || [];
      if (results.length) break;
    } catch (e) {
      console.warn('chart feed notice:', e.message);
    }
  }
  if (!results || !results.length) {
    // 取得失敗時、古いデータが残っていればそれを使う
    if (hit) return hit.tracks.slice(0, limit);
    return [];
  }

  // 試聴音源の場所はここでは取らない(ランキングを開いた時に /api/preview で取得)
  const tracks = results.map((r, i) => ({
    rank: i + 1,
    id: String(r.id),
    title: r.name || '',
    artist: r.artistName || '',
    img: r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb', '300x300bb') : null,
    appleUrl: r.url || null,
    previewUrl: null,
    // ジャンル(「音楽」という総称は除く)。国別プロフィールの「流行っているジャンル」集計に使う
    genres: (r.genres || [])
      .filter((g) => String(g.genreId) !== '34')
      .map((g) => ({ id: String(g.genreId), name: g.name || '' })),
  }));

  cache.set(key, { ts: Date.now(), tracks });
  return tracks.slice(0, limit);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const country = String(req.query.country || 'US').toUpperCase();
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

  try {
    // ジャンル集計用:上位100曲のジャンル情報だけを返す(曲名などは送らず軽くする)
    if (req.query.genres) {
      const tracks = await getCountryChart(country, 100);
      if (tracks.length) res.setHeader('Cache-Control', 's-maxage=28800, stale-while-revalidate=3600');
      return res.status(200).json({ country, count: tracks.length, genres: tracks.map((t) => t.genres || []) });
    }

    if (country === 'ALL') {
      const charts = {};
      const lists = await Promise.all(MAP_COUNTRIES.map((cc) => getCountryChart(cc, limit).catch(() => [])));
      MAP_COUNTRIES.forEach((cc, j) => {
        charts[cc] = lists[j];
      });
      res.setHeader('Cache-Control', 's-maxage=28800, stale-while-revalidate=3600');
      return res.status(200).json({ charts });
    }

    const tracks = await getCountryChart(country, limit);
    if (tracks.length) res.setHeader('Cache-Control', 's-maxage=28800, stale-while-revalidate=3600');
    return res.status(200).json({ country, tracks });
  } catch (e) {
    console.warn('chart handler notice:', e);
    return res.status(200).json({ country, tracks: [] });
  }
}
