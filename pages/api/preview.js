/**
 * 試聴用音源の個別取得(ランキング取得時に試聴URLが取れなかった曲の保険)
 * GET /api/preview?id=123456&country=JP
 */
export default async function handler(req, res) {
  const id = String(req.query.id || '').replace(/[^0-9]/g, '');
  const cc = String(req.query.country || 'US').toLowerCase().replace(/[^a-z]/g, '');
  if (!id) return res.status(200).json({ previewUrl: null });

  try {
    const r = await fetch(`https://itunes.apple.com/lookup?id=${id}&country=${cc}&entity=song`);
    if (r.ok) {
      const data = await r.json();
      const hit = (data.results || []).find((x) => x.previewUrl);
      if (hit) {
        res.setHeader('Cache-Control', 's-maxage=86400');
        return res.status(200).json({ previewUrl: hit.previewUrl });
      }
    }
  } catch (e) {
    console.warn('preview notice:', e.message);
  }
  return res.status(200).json({ previewUrl: null });
}
