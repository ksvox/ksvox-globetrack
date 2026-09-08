// Spotify API Token Cache
let cachedToken = null;
let tokenExpirationTime = 0;

// デモニュースデータ（RSS取得失敗時やフォールバック用）
const FALLBACK_NEWS = [
    { title: "NME Japan: 2026年注目のグローバル新世代アーティスト特集", url: "https://nme-jp.com" },
    { title: "Billboard: グローバルチャートで新たなストリーミング記録が誕生", url: "https://nme-jp.com" },
    { title: "Spotify Realtime: 世界各国のヒットチャート最新動向を公開中", url: "https://nme-jp.com" },
    { title: "音楽フェス2026最新ラインナップ発表ニュースまとめ", url: "https://nme-jp.com" },
    { title: "最新ヒットシングルが主要国のDailyチャート1位を席巻", url: "https://nme-jp.com" }
];

async function getSpotifyToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.warn("SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set in environment variables.");
        return null;
    }

    if (cachedToken && Date.now() < tokenExpirationTime) {
        return cachedToken;
    }

    try {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            console.error('Failed to authenticate with Spotify API:', response.statusText);
            return null;
        }

        const data = await response.json();
        cachedToken = data.access_token;
        tokenExpirationTime = Date.now() + (data.expires_in - 60) * 1000;
        return cachedToken;
    } catch (err) {
        console.error('Error fetching Spotify token:', err);
        return null;
    }
}

async function fetchLatestMusicNews() {
    const rssUrls = [
        'https://nme-jp.com/feed/',
        'https://billboard-japan.com/d_news/rss/'
    ];

    for (const url of rssUrls) {
        try {
            const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(3000) });
            if (!res.ok) continue;
            
            const xmlText = await res.text();
            const items = [];
            
            // XMLの<item>タグから title と link を抽出する正規表現
            const itemRegex = /<item>[\s\S]*?<\/item>/gi;
            const matches = xmlText.match(itemRegex) || [];

            for (const itemXml of matches.slice(0, 15)) {
                const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
                const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);

                if (titleMatch && linkMatch) {
                    const cleanTitle = titleMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
                    const cleanLink = linkMatch[1].trim();
                    if (cleanTitle && cleanLink) {
                        items.push({ title: cleanTitle, url: cleanLink });
                    }
                }
            }

            if (items.length > 0) {
                return items;
            }
        } catch (err) {
            console.warn(`Failed to fetch RSS news from ${url}:`, err.message);
        }
    }

    return FALLBACK_NEWS;
}

function getFallbackTracks(countryCode, limit = 10) {
    const DEMO_DATABASE = {
        'US': [
            { title: 'Birds of a Feather', artist: 'Billie Eilish', album: 'HIT ME HARD AND SOFT', img: 'https://i.scdn.co/image/ab67616d0000b27371d62ea7ea8a5be92d3c8262' },
            { title: 'A Bar Song (Tipsy)', artist: 'Shaboozey', album: 'Where I\'ve Been', img: 'https://i.scdn.co/image/ab67616d0000b273b3e2154366e665971485295c' },
            { title: 'Espresso', artist: 'Sabrina Carpenter', album: 'Short n\' Sweet', img: 'https://i.scdn.co/image/ab67616d0000b273fd8d7aeeed7e3e29f8f4165d' },
            { title: 'Not Like Us', artist: 'Kendrick Lamar', album: 'Not Like Us', img: 'https://i.scdn.co/image/ab67616d0000b2731ea0c62b2339cbf493a999ad' },
            { title: 'I Had Some Help', artist: 'Post Malone ft. Morgan Wallen', album: 'F-1 Trillion', img: 'https://i.scdn.co/image/ab67616d0000b2739a826470402e1c9d2334e357' }
        ],
        'JP': [
            { title: 'ライラック', artist: 'Mrs. GREEN APPLE', album: 'ライラック', img: 'https://i.scdn.co/image/ab67616d0000b2736bc88d44c455436b70a25fae' },
            { title: 'Bling-Bang-Bang-Born', artist: 'Creepy Nuts', album: 'Bling-Bang-Bang-Born', img: 'https://i.scdn.co/image/ab67616d0000b27329d5b78b8a599be5fb2d525a' },
            { title: '晩餐歌', artist: 'tuki.', album: '晩餐歌', img: 'https://i.scdn.co/image/ab67616d0000b27339d332d733475fb14db0fb1c' },
            { title: '幾億光年', artist: 'Omoinotake', album: '幾億光年', img: 'https://i.scdn.co/image/ab67616d0000b2733e8ca773d579b2a758782d73' },
            { title: '怪獣の花唄', artist: 'Vaundy', album: 'strobo', img: 'https://i.scdn.co/image/ab67616d0000b273204fb91e0a9d9e68c9bcad39' }
        ]
    };

    const base = DEMO_DATABASE[countryCode] || DEMO_DATABASE['US'];
    const results = [];

    for (let i = 0; i < limit; i++) {
        if (i < base.length) {
            const t = base[i];
            results.push({
                rank: i + 1,
                title: t.title,
                artist: t.artist,
                album: t.album,
                img: t.img,
                previewUrl: null,
                url: 'https://open.spotify.com'
            });
        } else {
            const num = i + 1;
            results.push({
                rank: num,
                title: `Top Global Track #${num}`,
                artist: `Global Artist ${num}`,
                album: `Hit Album Vol.${Math.ceil(num / 5)}`,
                img: `https://placehold.co/300x300/121212/1db954?text=%23${num}`,
                previewUrl: null,
                url: 'https://open.spotify.com'
            });
        }
    }
    return results;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');

    const { type, playlistId, country = 'US', limit = 10 } = req.query;

    // 1. ニュース自動取得リクエストのハンドリング
    if (type === 'news') {
        const news = await fetchLatestMusicNews();
        return res.status(200).json({ source: 'rss', news: news });
    }

    // 2. チャート楽曲取得リクエストのハンドリング
    const limitNum = parseInt(limit, 10) || 10;
    const token = await getSpotifyToken();

    if (!token || !playlistId) {
        const demoData = getFallbackTracks(country, limitNum);
        return res.status(200).json({ source: 'demo', tracks: demoData });
    }

    try {
        const market = country === 'GLOBAL' ? 'US' : country;
        const spotifyRes = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limitNum}&market=${market}`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        if (!spotifyRes.ok) {
            console.warn(`Spotify API response ${spotifyRes.status}, switching to fallback mock data.`);
            const demoData = getFallbackTracks(country, limitNum);
            return res.status(200).json({ source: 'fallback', tracks: demoData });
        }

        const data = await spotifyRes.json();
        if (!data.items || data.items.length === 0) {
            const demoData = getFallbackTracks(country, limitNum);
            return res.status(200).json({ source: 'empty-fallback', tracks: demoData });
        }

        const tracks = data.items.slice(0, limitNum).map((item, index) => {
            const track = item.track || item;
            
            // アルバムジャケット画像のURLを優先順位順に正しく抽出
            let albumImg = 'https://placehold.co/300x300/181818/ffffff?text=Music';
            if (track.album && track.album.images && track.album.images.length > 0) {
                albumImg = track.album.images[0].url;
            }

            return {
                rank: index + 1,
                title: track.name || 'Unknown Title',
                artist: track.artists ? track.artists.map(a => a.name).join(', ') : 'Unknown Artist',
                album: track.album ? track.album.name : '',
                img: albumImg,
                previewUrl: track.preview_url || null,
                url: track.external_urls ? track.external_urls.spotify : 'https://open.spotify.com'
            };
        });

        return res.status(200).json({ source: 'spotify', tracks: tracks });
    } catch (error) {
        console.error('Error fetching tracks from Spotify:', error);
        const demoData = getFallbackTracks(country, limitNum);
        return res.status(200).json({ source: 'error-fallback', tracks: demoData });
    }
}
