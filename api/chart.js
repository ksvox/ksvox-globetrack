// Vercel Serverless Function (Node.js CommonJS 互換)

const FALLBACK_NEWS = [
    { title: "Billboard: グローバルストリーミングチャート最新更新", url: "https://www.billboard.com" },
    { title: "NME: 今週の世界の注目のニューリリース・ヒット曲", url: "https://www.nme.com" },
    { title: "Official Charts: 各国デイリーランキング＆トレンド分析", url: "https://www.officialcharts.com" }
];

// 国別のタイムリーなヒット曲データベース（フォールバック用）
const COUNTRY_CHARTS = {
    'US': {
        billboard: [
            { title: "A Bar Song (Tipsy)", artist: "Shaboozey" },
            { title: "Birds of a Feather", artist: "Billie Eilish" },
            { title: "Espresso", artist: "Sabrina Carpenter" },
            { title: "Not Like Us", artist: "Kendrick Lamar" },
            { title: "Please Please Please", artist: "Sabrina Carpenter" },
            { title: "Good Luck, Babe!", artist: "Chappell Roan" },
            { title: "I Had Some Help", artist: "Post Malone ft. Morgan Wallen" },
            { title: "Lose Control", artist: "Teddy Swims" },
            { title: "Too Sweet", artist: "Hozier" },
            { title: "Beautiful Things", artist: "Benson Boone" }
        ],
        daily: [
            { title: "Birds of a Feather", artist: "Billie Eilish" },
            { title: "A Bar Song (Tipsy)", artist: "Shaboozey" },
            { title: "Espresso", artist: "Sabrina Carpenter" },
            { title: "Not Like Us", artist: "Kendrick Lamar" },
            { title: "Good Luck, Babe!", artist: "Chappell Roan" }
        ]
    },
    'GB': {
        billboard: [
            { title: "Espresso", artist: "Sabrina Carpenter" },
            { title: "Please Please Please", artist: "Sabrina Carpenter" },
            { title: "Birds of a Feather", artist: "Billie Eilish" },
            { title: "360", artist: "Charli xcx" },
            { title: "Houdini", artist: "Dua Lipa" },
            { title: "Good Luck, Babe!", artist: "Chappell Roan" },
            { title: "Stargazing", artist: "Myles Smith" },
            { title: "Austin", artist: "Dasha" }
        ],
        daily: [
            { title: "Espresso", artist: "Sabrina Carpenter" },
            { title: "360", artist: "Charli xcx" },
            { title: "Birds of a Feather", artist: "Billie Eilish" },
            { title: "Houdini", artist: "Dua Lipa" }
        ]
    },
    'JP': {
        billboard: [
            { title: "ライラック", artist: "Mrs. GREEN APPLE" },
            { title: "Bling-Bang-Bang-Born", artist: "Creepy Nuts" },
            { title: "晩餐歌", artist: "tuki." },
            { title: "幾億光年", artist: "Omoinotake" },
            { title: "はいろろ", artist: "Vaundy" },
            { title: "怪獣のサイズ", artist: "Mrs. GREEN APPLE" },
            { title: "アイドル", artist: "YOASOBI" },
            { title: "唱", artist: "Ado" }
        ],
        daily: [
            { title: "ライラック", artist: "Mrs. GREEN APPLE" },
            { title: "Bling-Bang-Bang-Born", artist: "Creepy Nuts" },
            { title: "晩餐歌", artist: "tuki." },
            { title: "幾億光年", artist: "Omoinotake" }
        ]
    },
    'KR': {
        daily: [
            { title: "Supernova", artist: "aespa" },
            { title: "How Sweet", artist: "NewJeans" },
            { title: "Magnetic", artist: "ILLIT" },
            { title: "SPOT!", artist: "ZICO ft. JENNIE" }
        ]
    },
    'FR': {
        daily: [
            { title: "Imagine", artist: "Carbonne" },
            { title: "Spider", artist: "GIMS" },
            { title: "Wayback", artist: "Jul" }
        ]
    },
    'DE': {
        daily: [
            { title: "Wunder", artist: "Ayliva x Apache 207" },
            { title: "Bauch Beine Po", artist: "Shirin David" }
        ]
    },
    'BR': {
        daily: [
            { title: "MTG Quem Não Quer Sou Eu", artist: "DJ Topo" },
            { title: "Escandalo Intimo", artist: "Luísa Sonza" }
        ]
    },
    'AU': {
        daily: [
            { title: "Birds of a Feather", artist: "Billie Eilish" },
            { title: "Espresso", artist: "Sabrina Carpenter" }
        ]
    }
};

// Apple Music Public RSS API (キー不要) からリアルタイム取得
async function fetchAppleMusicTopSongs(countryCode, limit = 10) {
    try {
        const country = (countryCode === 'GLOBAL' || countryCode === 'US') ? 'us' : countryCode.toLowerCase();
        const url = `https://rss.applemarketingtools.com/api/v2/${country}/music/most-played/${limit}/songs.json`;

        const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
        if (!res.ok) return null;

        const data = await res.json();
        const results = data.feed?.results;

        if (results && results.length > 0) {
            return results.map((item, index) => {
                let artwork = item.artworkUrl100 ? item.artworkUrl100.replace('{w}x{h}', '300x300').replace('100x100bb', '300x300bb') : null;
                return {
                    rank: index + 1,
                    title: item.name || 'Unknown Title',
                    artist: item.artistName || 'Unknown Artist',
                    album: item.collectionName || 'Top Track',
                    img: artwork,
                    url: item.url || `https://open.spotify.com/search/${encodeURIComponent((item.name || '') + ' ' + (item.artistName || ''))}`
                };
            });
        }
    } catch (err) {
        console.warn(`Apple Music RSS Fetch fallback for ${countryCode}:`, err.message);
    }
    return null;
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');

    const { type, country = 'US', chartType = 'daily', limit = 10 } = req.query || {};

    if (type === 'news') {
        return res.status(200).json({ source: 'rss', news: FALLBACK_NEWS });
    }

    const countryKey = country.toUpperCase();
    const limitNum = parseInt(limit, 10) || 10;

    // 1. Apple Music Public API からリアルタイム取得を試行
    try {
        const appleTracks = await fetchAppleMusicTopSongs(countryKey, limitNum);
        if (appleTracks && appleTracks.length > 0) {
            return res.status(200).json({ source: 'apple-music-live', tracks: appleTracks });
        }
    } catch (e) {
        console.warn('Live API attempt skipped:', e);
    }

    // 2. ローカル高品質フォールバックデータベースから取得
    const countryData = COUNTRY_CHARTS[countryKey] || COUNTRY_CHARTS['US'];
    const trackList = (chartType === 'billboard' && countryData.billboard) ? countryData.billboard : (countryData.daily || COUNTRY_CHARTS['US'].daily);

    const formattedTracks = [];
    for (let i = 0; i < Math.min(limitNum, Math.max(trackList.length, 10)); i++) {
        const item = trackList[i % trackList.length];
        formattedTracks.push({
            rank: i + 1,
            title: item.title,
            artist: item.artist,
            album: 'Top Hit',
            img: null,
            url: `https://open.spotify.com/search/${encodeURIComponent(item.title + ' ' + item.artist)}`
        });
    }

    return res.status(200).json({ source: 'fallback-database', tracks: formattedTracks });
};
