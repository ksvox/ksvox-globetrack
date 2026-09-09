/**
 * World Sound Chart - Serverless Function (v2.0)
 * GET /api/chart?country=US&chartType=daily&limit=10
 * GET /api/chart?type=playlists
 */

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token;
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, country = 'US', chartType = 'now', limit = 10 } = req.query;
  const token = await getSpotifyToken();

  // ① NOBU先生のSpotify公開プレイリスト取得処理
  if (type === 'playlists') {
    const userId = 'u8wz5jev5l2tvtn04mbgfzis2';
    if (!token) return res.status(200).json({ playlists: [] });

    try {
      const pRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists?limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        const playlists = (pData.items || []).map(p => ({
          id: p.id,
          name: p.name,
          img: p.images?.[0]?.url || '',
          tracksCount: p.tracks?.total || 0,
          url: p.external_urls?.spotify || ''
        }));
        return res.status(200).json({ playlists });
      }
    } catch (e) {
      console.error('Playlists API Error:', e);
    }
    return res.status(200).json({ playlists: [] });
  }

  // ② チャート取得処理 (US / GB / JP 対応)
  const countryCode = String(country).toUpperCase();
  const maxLimit = parseInt(limit, 10);

  // Billboardチャートリクエストの処理
  if (chartType === 'billboard') {
    const bbTracks = await fetchBillboardData(countryCode, maxLimit);
    return res.status(200).json({ country: countryCode, tracks: bbTracks });
  }

  // 地図上の“今聴かれている曲” (Spotify API)
  if (token) {
    try {
      const queryMap = {
        'US': 'tag:new genre:pop',
        'GB': 'tag:new genre:uk',
        'JP': 'tag:new genre:j-pop',
        'KR': 'genre:k-pop',
        'FR': 'genre:french',
        'DE': 'genre:german',
        'BR': 'genre:latin',
        'AU': 'genre:pop'
      };
      const q = queryMap[countryCode] || 'genre:pop';
      const sRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&market=${countryCode}&limit=${maxLimit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (sRes.ok) {
        const sData = await sRes.json();
        const tracks = (sData.tracks?.items || []).map((item, index) => ({
          rank: index + 1,
          title: item.name,
          artist: item.artists.map(a => a.name).join(', '),
          img: item.album?.images?.[0]?.url || getFallbackImg(item.name),
          url: item.external_urls?.spotify
        }));
        return res.status(200).json({ country: countryCode, tracks });
      }
    } catch (e) {}
  }

  return res.status(200).json({ country: countryCode, tracks: generateFallbackData(countryCode, maxLimit) });
}

// Billboard 国別スクレイピング・レスポンス生成
async function fetchBillboardData(country, limit) {
  let targetUrl = 'https://www.billboard.com/charts/hot-100/';
  if (country === 'GB') targetUrl = 'https://www.billboard.com/charts/u-k-songs-hotw/';
  if (country === 'JP') targetUrl = 'https://www.billboard-japan.com/charts/detail?a=hot100';

  try {
    const res = await fetch(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (res.ok) {
      const html = await res.text();
      const tracks = [];

      if (country === 'JP') {
        // Billboard Japan用パース
        const rowRegex = /<tr class="rank_detail">[\s\S]*?<td class="name">[\s\S]*?<p class="musician">(.*?)<\/p>[\s\S]*?<p class="song">(.*?)<\/p>[\s\S]*?<img src="(.*?)"/g;
        let match;
        let rank = 1;
        while ((match = rowRegex.exec(html)) !== null && rank <= limit) {
          tracks.push({
            rank: rank++,
            artist: stripTags(match[1]),
            title: stripTags(match[2]),
            img: match[3]?.startsWith('http') ? match[3] : `https://www.billboard-japan.com${match[3]}`,
            url: `https://open.spotify.com/search/${encodeURIComponent(match[2] + ' ' + match[1])}`
          });
        }
      } else {
        // Billboard.com (US / UK) 用パース
        const titleRegex = /<h3 id="title-of-a-story" class="c-title[^">]*">(.*?)<\/h3>[\s\S]*?<span class="c-label[^">]*">(.*?)<\/span>/g;
        let match;
        let rank = 1;
        while ((match = titleRegex.exec(html)) !== null && rank <= limit) {
          const title = stripTags(match[1]);
          const artist = stripTags(match[2]);
          if (title && artist && !artist.includes('NEW') && !artist.includes('RE-ENTRY')) {
            tracks.push({
              rank: rank++,
              title,
              artist,
              img: getFallbackImg(title), // iTunes / Spotify検索画像への補正用
              url: `https://open.spotify.com/search/${encodeURIComponent(title + ' ' + artist)}`
            });
          }
        }
      }
      if (tracks.length > 0) return tracks;
    }
  } catch (e) {}

  return generateFallbackData(country, limit);
}

function stripTags(str) {
  return String(str || '').replace(/<[^>]*>/g, '').trim();
}

function getFallbackImg(title) {
  return `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80`;
}

function generateFallbackData(country, limit) {
  const usSongs = [
    { title: 'A Bar Song (Tipsy)', artist: 'Shaboozey' },
    { title: 'Birds of a Feather', artist: 'Billie Eilish' },
    { title: 'Espresso', artist: 'Sabrina Carpenter' },
    { title: 'Not Like Us', artist: 'Kendrick Lamar' },
    { title: 'Please Please Please', artist: 'Sabrina Carpenter' }
  ];
  const gbSongs = [
    { title: 'Please Please Please', artist: 'Sabrina Carpenter' },
    { title: 'Taste', artist: 'Sabrina Carpenter' },
    { title: 'Good Luck, Babe!', artist: 'Chappell Roan' },
    { title: 'Angel of My Dreams', artist: 'JADE' },
    { title: 'Kisses', artist: 'BL3SS x CamrinWatsin' }
  ];
  const jpSongs = [
    { title: 'ライラック', artist: 'Mrs. GREEN APPLE' },
    { title: 'Bling-Bang-Bang-Born', artist: 'Creepy Nuts' },
    { title: '晩餐歌', artist: 'tuki.' },
    { title: '幾億光年', artist: 'Omoinotake' },
    { title: '相思相愛', artist: 'aiko' }
  ];

  const list = country === 'JP' ? jpSongs : country === 'GB' ? gbSongs : usSongs;
  return list.slice(0, limit).map((s, i) => ({
    rank: i + 1,
    title: s.title,
    artist: s.artist,
    img: getFallbackImg(s.title),
    url: `https://open.spotify.com/search/${encodeURIComponent(s.title + ' ' + s.artist)}`
  }));
}
