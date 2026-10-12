/**
 * 試聴用30秒音源の場所を取得
 * GET /api/preview?ids=111,222,333&country=JP  … まとめて取得 → { previews: { "111": "https://..." } }
 * GET /api/preview?id=111&country=JP           … 1曲だけ     → { previewUrl: "https://..." }
 */
const CACHE_TTL = 6 * 60 * 60 * 1000;
const cache = new Map(); // key: `${cc}-${id}` → { ts, url }

async function lookup(ids, cc) {
  const out = {};
  const need = [];
  ids.forEach((id) => {
    const hit = cache.get(`${cc}-${id}`);
    if (hit && Date.now() - hit.ts < CACHE_TTL) {
      if (hit.url) out[id] = hit.url;
    } else {
      need.push(id);
    }
  });
  if (!need.length) return out;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const r = await fetch(`https://itunes.apple.com/lookup?id=${need.join(',')}&country=${cc}&entity=song`, {
      signal: controller.signal,
    });
    if (r.ok) {
      const data = await r.json();
      const found = {};
      (data.results || []).forEach((x) => {
        if (x.trackId && x.previewUrl) found[String(x.trackId)] = x.previewUrl;
      });
      need.forEach((id) => {
        cache.set(`${cc}-${id}`, { ts: Date.now(), url: found[id] || null });
        if (found[id]) out[id] = found[id];
      });
    }
  } catch (e) {
    console.warn('preview notice:', e.message);
  } finally {
    clearTimeout(timer);
  }
  return out;
}

export default async function handler(req, res) {
  const cc = String(req.query.country || 'US').toLowerCase().replace(/[^a-z]/g, '') || 'us';
  const raw = String(req.query.ids || req.query.id || '');
  const ids = raw
    .split(',')
    .map((x) => x.replace(/[^0-9]/g, ''))
    .filter(Boolean)
    .slice(0, 50);

  const previews = ids.length ? await lookup(ids, cc) : {};
  if (Object.keys(previews).length) res.setHeader('Cache-Control', 's-maxage=21600');

  if (req.query.ids) return res.status(200).json({ previews });
  return res.status(200).json({ previewUrl: previews[ids[0]] || null });
}
