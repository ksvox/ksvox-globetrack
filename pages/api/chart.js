/**
 * World Sound Chart - API Route
 * GET /api/chart?country=US&chartType=daily&limit=10
 */

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { country = 'US', chartType = 'daily', limit = 10 } = req.query;
  const countryCode = String(country).toUpperCase();
  const maxLimit = parseInt(limit, 10);

  // --- Billboard / iTunes Hot 20 ランキング取得 ---
  if (chartType === 'billboard') {
    try {
      const itunesRes = await fetch(
        `https://itunes.apple.com/${countryCode.toLowerCase()}/rss/topsongs/limit=${maxLimit}/json`
      );
      if (itunesRes.ok) {
        const itunesData = await itunesRes.json();
        const entries = itunesData.feed?.entry || [];
        const tracks = entries.map((item, index) => ({
          rank: index + 1,
          title: item['im:name']?.label || '',
          artist: item['im:artist']?.label || '',
          img: item['im:image']?.[2]?.label?.replace('170x170bb', '300x300bb') || null,
          url:
            item.link?.[0]?.attributes?.href ||
            `https://open.spotify.com/search/${encodeURIComponent(
              (item['im:name']?.label || '') + ' ' + (item['im:artist']?.label || '')
            )}`,
        }));
        return res.status(200).json({ country: countryCode, tracks });
      }
    } catch (e) {
      console.warn('Billboard RSS connect notice:', e);
    }
  }

  // --- 地図上の「今聴かれている曲」取得 ---
  try {
    const token = await getSpotifyToken();

    if (token) {
      const spotifyRes = await fetch(
        `https://api.spotify.com/v1/search?q=genre%3Apop&type=track&market=${countryCode}&limit=${maxLimit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (spotifyRes.ok) {
        const spotifyData = await spotifyRes.json();
        const tracks = spotifyData.tracks.items.map((item, index) => ({
          rank: index + 1,
          title: item.name,
          artist: item.artists.map((a) => a.name).join(', '),
          img: item.album.images[0]?.url || null,
          url: item.external_urls.spotify,
        }));

        return res.status(200).json({ country: countryCode, tracks });
      }
    }
  } catch (e) {
    console.warn('Spotify API connect notice:', e);
  }

  // フォールバック
  const fallbackTracks = generateFallbackData(countryCode, chartType, maxLimit);
  return res.status(200).json({ country: countryCode, tracks: fallbackTracks });
}

function generateFallbackData(country, chartType, limit) {
  const songs = [
    { title: 'Birds of a Feather', artist: 'Billie Eilish' },
    { title: 'Espresso', artist: 'Sabrina Carpenter' },
    { title: 'A Bar Song (Tipsy)', artist: 'Shaboozey' },
    { title: 'Not Like Us', artist: 'Kendrick Lamar' },
    { title: 'Please Please Please', artist: 'Sabrina Carpenter' },
    { title: 'Good Luck, Babe!', artist: 'Chappell Roan' },
    { title: 'I Had Some Help', artist: 'Post Malone' },
    { title: 'Lose Control', artist: 'Teddy Swims' },
    { title: 'Too Sweet', artist: 'Hozier' },
    { title: 'Beautiful Things', artist: 'Benson Boone' },
    { title: 'ライラック', artist: 'Mrs. GREEN APPLE' },
    { title: 'Bling-Bang-Bang-Born', artist: 'Creepy Nuts' },
    { title: '晩餐歌', artist: 'tuki.' },
    { title: '幾億光年', artist: 'Omoinotake' },
    { title: 'Supernova', artist: 'aespa' },
    { title: 'How Sweet', artist: 'NewJeans' },
    { title: 'Magnetic', artist: 'ILLIT' },
    { title: 'SPOT!', artist: 'ZICO ft. JENNIE' },
    { title: '360', artist: 'Charli xcx' },
    { title: 'Houdini', artist: 'Dua Lipa' },
  ];

  return songs.slice(0, limit).map((s, i) => ({
    rank: i + 1,
    title: s.title,
    artist: s.artist,
    img: null,
    url: `https://open.spotify.com/search/${encodeURIComponent(s.title + ' ' + s.artist)}`,
  }));
}
