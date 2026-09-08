// Spotify API Token Cache Variables
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

/**
 * Spotify APIキー不要で、kworb.netから最新のSpotify Daily Streamチャートをパースしてリアルタイム取得します。
 */
async function fetchKworbSpotifyChart(countryCode, limit = 10) {
    try {
        const countrySlug = countryCode.toLowerCase() === 'global' ? 'global' : countryCode.toLowerCase();
        const url = `https://kworb.net/spotify/country/${countrySlug}_daily.html`;
        
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            signal: AbortSignal.timeout(4000)
        });

        if (!res.ok) return null;
        const html = await res.text();

        // テーブルの <tr> から曲名とアーティストを抽出する簡易正規表現パース
        const rowRegex = /<td class="mp text">(?:<div[^>]*>)?<a href="[^"]*">(.*?)<\/a>\s*-\s*<a href="[^"]*">(.*?)<\/a>/gi;
        const tracks = [];
        let match;
        let rank = 1;

        while ((match = rowRegex.exec(html)) !== null && rank <= limit) {
            const artist = match[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
            const title = match[2].replace(/<\/?[^>]+(>|$)/g, "").trim();

            if (artist && title) {
                tracks.push({
                    rank: rank,
                    title: title,
                    artist: artist,
                    album: 'Spotify Live Daily Chart',
                    img: `https://placehold.co/300x300/181818/1DB954?text=Spotify+No.${rank}`,
                    previewUrl: null,
                    url: `https://open.spotify.com/search/${encodeURIComponent(title + ' ' + artist)}`
                });
                rank++;
            }
        }

        if (tracks.length > 0) {
            return tracks;
        }
    } catch (err) {
        console.warn(`Kworb Spotify Live Scraping failed for ${countryCode}:`, err.message);
    }
    return null;
}

/**
 * Spotify APIキー不要・完全無料で利用できる Apple Music Public RSS API からリアルタイム再生数トップ曲を取得します。
 */
async function fetchAppleMusicTopSongs(countryCode, limit = 10) {
    try {
        const country = countryCode === 'GLOBAL' ? 'us' : countryCode.toLowerCase();
        const url = `https://rss.applemarketingtools.com/api/v2/${country}/music/most-played/${limit}/songs.json`;

        const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
        if (!res.ok) return null;

        const data = await res.json();
        const results = data.feed?.results;

        if (results && results.length > 0) {
            return results.map((item, index) => {
                // 画像URLを高解像度化 (100x100 -> 300x300)
                let artwork = item.artworkUrl100 ? item.artworkUrl100.replace('{w}x{h}', '300x300').replace('100x100bb', '300x300bb') : null;

                return {
                    rank: index + 1,
                    title: item.name || 'Unknown Title',
                    artist: item.artistName || 'Unknown Artist',
                    album: item.collectionName || 'Top Song',
                    img: artwork || `https://placehold.co/300x300/181818/fc3c44?text=Top+${index + 1}`,
                    previewUrl: null,
                    url: item.url || `https://open.spotify.com/search/${encodeURIComponent(item.name + ' ' + item.artistName)}`
                };
            });
        }
    } catch (err) {
        console.warn(`Apple Music RSS API fetch failed for ${countryCode}:`, err.message);
    }
    return null;
}

/**
 * Vercel環境変数 (SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET) を使用して
 * Spotify API のアクセストークンを自動取得・キャッシュします。
 */
async function getSpotifyToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.warn("SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is not set in Vercel Environment Variables.");
        return null;
    }

    // キャッシュされたトークンが有効期限内であれば再利用
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
        // トークンの有効期限（一般的に1時間）から余裕を持って60秒引いた時間を記憶
        tokenExpirationTime = Date.now() + (data.expires_in - 60) * 1000;
        return cachedToken;
    } catch (err) {
        console.error('Error fetching Spotify token:', err);
        return null;
    }
}

/**
 * 音楽メディアの公式RSSフィードから最新ニュース記事をフェッチ・パースします。
 */
async function fetchLatestMusicNews() {
    const rssUrls = [
        'https://nme-jp.com/feed/',
        'https://billboard-japan.com/d_news/rss/'
    ];

    for (const url of rssUrls) {
        try {
            const res = await fetch(url, { 
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, 
                signal: AbortSignal.timeout(3500) 
            });
            if (!res.ok) continue;
            
            const xmlText = await res.text();
            const items = [];
            
            // XMLの <item> タグから title と link を抽出する正規表現
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

/**
 * APIキー未設定時やネットワーク障害時の安全なフォールバック用デモ楽曲データを返します。
 */
function getFallbackTracks(countryCode, limit = 10) {
    const DEMO_DATABASE = {
        'US': [
            { title: 'Birds of a Feather', artist: 'Billie Eilish', album: 'HIT ME HARD AND SOFT', img: 'https://i.scdn.co/image/ab67616d0000b27371d62ea7ea8a5be92d3c8262' },
            { title: 'A Bar Song (Tipsy)', artist: 'Shaboozey', album: 'Where I\'ve Been', img: 'https://i.scdn.co/image/ab67616d0000b273b3e2154366e665971485295c' },
            { title: 'Espresso', artist: 'Sabrina Carpenter', album: 'Short n\' Sweet', img: 'https://i.scdn.co/image/ab67616d0000b273fd8d7aeeed7e3e29f8f4165d' },
            { title: 'Not Like Us', artist: 'Kendrick Lamar', album: 'Not Like Us', img: 'https://i.scdn.co/image/ab67616d0000b2731ea0c62b2339cbf493a999ad' },
            { title: 'I Had Some Help', artist: 'Post Malone ft. Morgan Wallen', album: 'F-1 Trillion', img: 'https://i.scdn.co/image/ab67616d0000b2739a826470402e1c9d2334e357' },
            { title: 'Good Luck, Babe!', artist: 'Chappell Roan', album: 'Good Luck, Babe!', img: 'https://i.scdn.co/image/ab67616d0000b273a219a1a2e343603403328e7d' }
        ],
        'JP': [
            { title: 'ライラック', artist: 'Mrs. GREEN APPLE', album: 'ライラック', img: 'https://i.scdn.co/image/ab67616d0000b2736bc88d44c455436b70a25fae' },
            { title: 'Bling-Bang-Bang-Born', artist: 'Creepy Nuts', album: 'Bling-Bang-Bang-Born', img: 'https://i.scdn.co/image/ab67616d0000b27329d5b78b8a599be5fb2d525a' },
            { title: '晩餐歌', artist: 'tuki.', album: '晩餐歌', img: 'https://i.scdn.co/image/ab67616d0000b27339d332d733475fb14db0fb1c' },
            { title: '幾億光年', artist: 'Omoinotake', album: '幾億光年', img: 'https://i.scdn.co/image/ab67616d0000b2733e8ca773d579b2a758782d73' },
            { title: '怪獣の花唄', artist: 'Vaundy', album: 'strobo', img: 'https://i.scdn.co/image/ab67616d0000b273204fb91e0a9d9e68c9bcad39' }
        ],
        'GB': [
            { title: 'Espresso', artist: 'Sabrina Carpenter', album: 'Short n\' Sweet', img: 'https://i.scdn.co/image/ab67616d0000b273fd8d7aeeed7e3e29f8f4165d' },
            { title: 'Please Please Please', artist: 'Sabrina Carpenter', album: 'Short n\' Sweet', img: 'https://i.scdn.co/image/ab67616d0000b273fd8d7aeeed7e3e29f8f4165d' },
            { title: '360', artist: 'Charli xcx', album: 'BRAT', img: 'https://i.scdn.co/image/ab67616d0000b2738a0f9012f9e42e4726b28b78' },
            { title: 'Birds of a Feather', artist: 'Billie Eilish', album: 'HIT ME HARD AND SOFT', img: 'https://i.scdn.co/image/ab67616d0000b27371d62ea7ea8a5be92d3c8262' }
        ],
        'KR': [
            { title: 'Magnetic', artist: 'ILLIT', album: 'SUPER REAL ME', img: 'https://i.scdn.co/image/ab67616d0000b2739343ee0f7574b62dbf06df14' },
            { title: 'Supernova', artist: 'aespa', album: 'Armageddon', img: 'https://i.scdn.co/image/ab67616d0000b2734138e6dfd649bb55f4645efb' },
            { title: 'How Sweet', artist: 'NewJeans', album: 'How Sweet', img: 'https://i.scdn.co/image/ab67616d0000b2731d1b09b0b8c38fa5a691df36' }
        ]
    };

    const TRENDING_GLOBAL_2026 = DEMO_DATABASE['US'];
    const base = DEMO_DATABASE[countryCode] || TRENDING_GLOBAL_2026;
    const results = [];

    for (let i = 0; i < limit; i++) {
        if (i < base.length) {
            const t = base[i];
            results.push({
                rank: i + 1,
                title: t.title,
                artist: t.artist,
                album: t.album || 'Trending Single',
                img: t.img,
                previewUrl: null,
                url: `https://open.spotify.com/search/${encodeURIComponent(t.title + ' ' + t.artist)}`
            });
        } else {
            const sample = base[i % base.length];
            const num = i + 1;
            results.push({
                rank: num,
                title: `${sample.title}`,
                artist: sample.artist,
                album: sample.album,
                img: sample.img,
                previewUrl: null,
                url: `https://open.spotify.com/search/${encodeURIComponent(sample.title + ' ' + sample.artist)}`
            });
        }
    }
    return results;
}

/**
 * Spotify Browse New Releases からタイムリーな流行曲を取得するフォールバック処理
 */
async function fetchNewReleasesOrSearch(token, country, limit) {
    try {
        const market = country === 'GLOBAL' ? 'US' : country;
        // 特定のプレイリストが取得できない場合は新着・ヒット曲検索で補完
        const spotifyRes = await fetch(
            `https://api.spotify.com/v1/browse/new-releases?country=${market}&limit=${limit}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (spotifyRes.ok) {
            const data = await spotifyRes.json();
            if (data.albums && data.albums.items.length > 0) {
                return data.albums.items.map((album, index) => ({
                    rank: index + 1,
                    title: album.name,
                    artist: album.artists.map(a => a.name).join(', '),
                    album: album.name,
                    img: album.images?.[0]?.url || 'https://placehold.co/300x300/181818/ffffff?text=Music',
                    previewUrl: null,
                    url: album.external_urls?.spotify || 'https://open.spotify.com'
                }));
            }
        }
    } catch (e) {
        console.warn('Error fetching new releases from Spotify:', e);
    }
    return null;
}

/**
 * Vercel Serverless Function エントリーポイント
 */
export default async function handler(req, res) {
    // CORS & Content-Type ヘッダー設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');

    const { type, playlistId, country = 'US', limit = 10 } = req.query;

    // 1. 最新ニュース自動収集リクエスト (type=news) のハンドリング
    if (type === 'news') {
        const news = await fetchLatestMusicNews();
        return res.status(200).json({ source: 'rss', news: news });
    }

    // 2. チャート楽曲取得リクエストのハンドリング
    const limitNum = parseInt(limit, 10) || 10;
    const token = await getSpotifyToken();

    // ★ Spotifyトークン（APIキー）が無い場合の「完全無料・キー不要リアルタイム取得」
    if (!token) {
        // 方法1: KworbからリアルタイムSpotify Daily StreamチャートをWebスクレイピング
        const kworbTracks = await fetchKworbSpotifyChart(country, limitNum);
        if (kworbTracks && kworbTracks.length > 0) {
            return res.status(200).json({ source: 'kworb-spotify-live', tracks: kworbTracks });
        }

        // 方法2: Apple Music Public RSS API から「Most Played (最も再生されている曲)」をキーなし取得
        const appleTracks = await fetchAppleMusicTopSongs(country, limitNum);
        if (appleTracks && appleTracks.length > 0) {
            return res.status(200).json({ source: 'apple-music-live', tracks: appleTracks });
        }

        // 方法3: ネットワーク不通時のデモデータ
        const demoData = getFallbackTracks(country, limitNum);
        return res.status(200).json({ source: 'demo', tracks: demoData });
    }

    // Spotify Token がある場合のリクエスト処理
    try {
        const market = country === 'GLOBAL' ? 'US' : country;
        const spotifyRes = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limitNum}&market=${market}`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        if (!spotifyRes.ok) {
            console.warn(`Spotify Playlist API responded with status ${spotifyRes.status}. Trying Kworb & Apple Live fallback.`);
            const kworbTracks = await fetchKworbSpotifyChart(country, limitNum);
            if (kworbTracks && kworbTracks.length > 0) {
                return res.status(200).json({ source: 'kworb-spotify-live', tracks: kworbTracks });
            }

            const appleTracks = await fetchAppleMusicTopSongs(country, limitNum);
            if (appleTracks && appleTracks.length > 0) {
                return res.status(200).json({ source: 'apple-music-live', tracks: appleTracks });
            }

            const demoData = getFallbackTracks(country, limitNum);
            return res.status(200).json({ source: 'fallback', tracks: demoData });
        }

        const data = await spotifyRes.json();
        if (!data.items || data.items.length === 0) {
            const appleTracks = await fetchAppleMusicTopSongs(country, limitNum);
            if (appleTracks && appleTracks.length > 0) {
                return res.status(200).json({ source: 'apple-music-live', tracks: appleTracks });
            }
            const demoData = getFallbackTracks(country, limitNum);
            return res.status(200).json({ source: 'empty-fallback', tracks: demoData });
        }

        // Spotifyレスポンスの整形
        const tracks = data.items.slice(0, limitNum).map((item, index) => {
            const track = item.track || item;
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
        console.error('Error in Vercel function:', error);
        const appleTracks = await fetchAppleMusicTopSongs(country, limitNum);
        if (appleTracks && appleTracks.length > 0) {
            return res.status(200).json({ source: 'apple-music-live', tracks: appleTracks });
        }
        const demoData = getFallbackTracks(country, limitNum);
        return res.status(200).json({ source: 'error-fallback', tracks: demoData });
    }
}
